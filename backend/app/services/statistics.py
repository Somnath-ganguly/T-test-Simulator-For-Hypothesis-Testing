import numpy as np
from scipy import stats
from typing import List, Optional, Tuple, Dict, Any
from app.schemas.ttest import (
    TestType,
    AlternativeHypothesis,
    TTestRequest,
    TTestResponse,
    CurvePoint,
    HistogramBin,
    InterpretationDetails
)
from app.services.interpretation import (
    format_hypotheses,
    generate_interpretation,
    get_effect_size_label
)

def run_ttest_analysis(req: TTestRequest) -> TTestResponse:
    # 1. Input Validation
    sample_a = np.array(req.sample_a, dtype=float)
    n_a = len(sample_a)
    if n_a < 2:
        raise ValueError("Sample A must contain at least 2 valid numeric observations.")
        
    std_a = float(np.std(sample_a, ddof=1))
    if std_a == 0:
        raise ValueError("Sample A has zero variance (all values are identical). Cannot compute t-statistic.")
        
    mean_a = float(np.mean(sample_a))
    sem_a = float(std_a / np.sqrt(n_a))
    
    label_a = req.label_a or "Sample A"
    label_b = req.label_b or "Sample B"
    
    warnings = []
    
    if n_a < 15:
        warnings.append(f"{label_a} sample size is small (n={n_a} < 15). Normality assumption is critical.")
        
    try:
        _, shapiro_p_a = stats.shapiro(sample_a)
        shapiro_p_a = float(shapiro_p_a)
        if shapiro_p_a < 0.05:
            warnings.append(f"{label_a} may depart from a normal distribution (Shapiro-Wilk p = {shapiro_p_a:.4f}).")
    except Exception:
        shapiro_p_a = None

    sample_b = None
    n_b = None
    mean_b = None
    std_b = None
    sem_b = None
    shapiro_p_b = None
    levene_p = None
    
    # 2. Perform Statistical Computations
    if req.test_type == TestType.ONE_SAMPLE:
        test_name = "One-Sample t-Test"
        diff_mean = mean_a - req.mu_0
        std_err = sem_a
        df = float(n_a - 1)
        t_stat = float(diff_mean / std_err)
        cohens_d = float(diff_mean / std_a)
        ci_center = mean_a  # CI for the population mean mu
        
    elif req.test_type == TestType.INDEPENDENT:
        if req.sample_b is None or len(req.sample_b) < 2:
            raise ValueError("Independent t-test requires Sample B with at least 2 observations.")
            
        sample_b = np.array(req.sample_b, dtype=float)
        n_b = len(sample_b)
        std_b = float(np.std(sample_b, ddof=1))
        if std_b == 0:
            raise ValueError("Sample B has zero variance. Cannot compute t-statistic.")
            
        mean_b = float(np.mean(sample_b))
        sem_b = float(std_b / np.sqrt(n_b))
        diff_mean = mean_a - mean_b
        ci_center = diff_mean
        
        if n_b < 15:
            warnings.append(f"{label_b} sample size is small (n={n_b} < 15). Normality assumption is critical.")
            
        try:
            _, shapiro_p_b = stats.shapiro(sample_b)
            shapiro_p_b = float(shapiro_p_b)
            if shapiro_p_b < 0.05:
                warnings.append(f"{label_b} may depart from a normal distribution (Shapiro-Wilk p = {shapiro_p_b:.4f}).")
        except Exception:
            shapiro_p_b = None
            
        try:
            _, levene_p = stats.levene(sample_a, sample_b)
            levene_p = float(levene_p)
            if levene_p < 0.05 and req.equal_var:
                warnings.append(
                    f"Levene's test indicates unequal variances (p = {levene_p:.4f}). Welch's t-test (equal_var=False) is recommended."
                )
        except Exception:
            levene_p = None
            
        if req.equal_var:
            test_name = "Student's Independent Two-Sample t-Test (Pooled Variance)"
            df = float(n_a + n_b - 2)
            s_pooled_sq = ((n_a - 1) * (std_a ** 2) + (n_b - 1) * (std_b ** 2)) / df
            s_pooled = np.sqrt(s_pooled_sq)
            std_err = float(np.sqrt(s_pooled_sq * (1.0 / n_a + 1.0 / n_b)))
            t_stat = float((diff_mean - req.mu_0) / std_err)
            cohens_d = float(diff_mean / s_pooled) if s_pooled > 0 else 0.0
        else:
            test_name = "Welch's Independent Two-Sample t-Test (Unequal Variances)"
            v_a = (std_a ** 2) / n_a
            v_b = (std_b ** 2) / n_b
            std_err = float(np.sqrt(v_a + v_b))
            t_stat = float((diff_mean - req.mu_0) / std_err)
            df_num = (v_a + v_b) ** 2
            df_den = (v_a ** 2) / (n_a - 1) + (v_b ** 2) / (n_b - 1)
            df = float(df_num / df_den)
            s_pooled = np.sqrt(((n_a - 1) * (std_a ** 2) + (n_b - 1) * (std_b ** 2)) / (n_a + n_b - 2))
            cohens_d = float(diff_mean / s_pooled) if s_pooled > 0 else 0.0

    elif req.test_type == TestType.PAIRED:
        if req.sample_b is None:
            raise ValueError("Paired t-test requires Sample B.")
            
        sample_b = np.array(req.sample_b, dtype=float)
        n_b = len(sample_b)
        if n_a != n_b:
            raise ValueError(f"Paired t-test requires equal sample sizes. Sample A length ({n_a}) != Sample B length ({n_b}).")
            
        mean_b = float(np.mean(sample_b))
        std_b = float(np.std(sample_b, ddof=1))
        sem_b = float(std_b / np.sqrt(n_b))
        
        diffs = sample_a - sample_b
        std_diff = float(np.std(diffs, ddof=1))
        if std_diff == 0:
            raise ValueError("Paired differences have zero variance.")
            
        test_name = "Paired Samples t-Test"
        diff_mean = float(np.mean(diffs))
        ci_center = diff_mean
        std_err = float(std_diff / np.sqrt(n_a))
        df = float(n_a - 1)
        t_stat = float((diff_mean - req.mu_0) / std_err)
        cohens_d = float(diff_mean / std_diff)
        
        try:
            _, shapiro_p_diff = stats.shapiro(diffs)
            if shapiro_p_diff < 0.05:
                warnings.append(f"Paired differences may depart from normality (Shapiro-Wilk p = {shapiro_p_diff:.4f}).")
        except Exception:
            pass

    # 3. p-value & Confidence Intervals
    alt = req.alternative
    if alt == AlternativeHypothesis.TWO_SIDED:
        p_val = float(2 * stats.t.sf(np.abs(t_stat), df))
        t_crit = float(stats.t.ppf(1 - req.alpha / 2, df))
        ci_lower = float(ci_center - t_crit * std_err)
        ci_upper = float(ci_center + t_crit * std_err)
        crit_low = -t_crit
        crit_high = t_crit
    elif alt == AlternativeHypothesis.LESS:
        p_val = float(stats.t.cdf(t_stat, df))
        t_crit = float(stats.t.ppf(1 - req.alpha, df))
        ci_lower = float("-inf")
        ci_upper = float(ci_center + t_crit * std_err)
        crit_low = -t_crit
        crit_high = None
    elif alt == AlternativeHypothesis.GREATER:
        p_val = float(stats.t.sf(t_stat, df))
        t_crit = float(stats.t.ppf(1 - req.alpha, df))
        ci_lower = float(ci_center - t_crit * std_err)
        ci_upper = float("inf")
        crit_low = None
        crit_high = t_crit

    is_significant = bool(p_val < req.alpha)
    decision = "Reject H₀" if is_significant else "Fail to reject H₀"

    null_hyp, alt_hyp = format_hypotheses(
        req.test_type, req.alternative, req.mu_0, label_a, label_b
    )
    
    interp = generate_interpretation(
        req.test_type, req.alternative, req.alpha, t_stat, p_val, df,
        diff_mean, ci_lower if ci_lower != float("-inf") else ci_center - 4*std_err,
        ci_upper if ci_upper != float("inf") else ci_center + 4*std_err,
        cohens_d, is_significant, label_a, label_b, req.mu_0
    )
    
    distribution_curve = []
    max_range = max(4.5, abs(t_stat) + 1.0)
    x_grid = np.linspace(-max_range, max_range, 120)
    
    for x in x_grid:
        density = float(stats.t.pdf(x, df))
        is_crit = False
        if alt == AlternativeHypothesis.TWO_SIDED:
            is_crit = (x <= crit_low or x >= crit_high)
        elif alt == AlternativeHypothesis.LESS:
            is_crit = (x <= crit_low)
        elif alt == AlternativeHypothesis.GREATER:
            is_crit = (x >= crit_high)
            
        distribution_curve.append(CurvePoint(
            x=round(float(x), 3),
            density=round(density, 4),
            is_critical=is_crit
        ))

    histograms = build_histograms(sample_a, sample_b)

    return TTestResponse(
        test_type=req.test_type,
        test_name=test_name,
        alternative=req.alternative,
        alpha=req.alpha,
        null_hypothesis=null_hyp,
        alt_hypothesis=alt_hyp,
        t_statistic=round(t_stat, 4),
        p_value=round(p_val, 6),
        df=round(df, 3),
        label_a=label_a,
        label_b=label_b if sample_b is not None else None,
        n_a=n_a,
        mean_a=round(mean_a, 4),
        std_a=round(std_a, 4),
        sem_a=round(sem_a, 4),
        n_b=n_b,
        mean_b=round(mean_b, 4) if mean_b is not None else None,
        std_b=round(std_b, 4) if std_b is not None else None,
        sem_b=round(sem_b, 4) if sem_b is not None else None,
        diff_mean=round(diff_mean, 4),
        std_err=round(std_err, 4),
        conf_level=round(1 - req.alpha, 2),
        ci_lower=round(ci_lower, 4) if ci_lower != float("-inf") else -999999.0,
        ci_upper=round(ci_upper, 4) if ci_upper != float("inf") else 999999.0,
        cohens_d=round(cohens_d, 4),
        effect_size_label=get_effect_size_label(cohens_d),
        decision=decision,
        is_significant=is_significant,
        normality_p_a=round(shapiro_p_a, 4) if shapiro_p_a is not None else None,
        normality_p_b=round(shapiro_p_b, 4) if shapiro_p_b is not None else None,
        levene_p=round(levene_p, 4) if levene_p is not None else None,
        warnings=warnings,
        interpretation=interp,
        distribution_curve=distribution_curve,
        histograms=histograms,
        critical_value_low=round(crit_low, 3) if crit_low is not None else None,
        critical_value_high=round(crit_high, 3) if crit_high is not None else None
    )

def build_histograms(sample_a: np.ndarray, sample_b: Optional[np.ndarray] = None, num_bins: int = 12) -> List[HistogramBin]:
    if sample_b is not None:
        combined = np.concatenate([sample_a, sample_b])
    else:
        combined = sample_a
        
    min_val = np.min(combined)
    max_val = np.max(combined)
    if min_val == max_val:
        min_val -= 1.0
        max_val += 1.0
        
    bin_edges = np.linspace(min_val, max_val, num_bins + 1)
    counts_a, _ = np.histogram(sample_a, bins=bin_edges)
    
    counts_b = None
    if sample_b is not None:
        counts_b, _ = np.histogram(sample_b, bins=bin_edges)
        
    bins_out = []
    for i in range(num_bins):
        start = float(bin_edges[i])
        end = float(bin_edges[i+1])
        center = float((start + end) / 2.0)
        bins_out.append(HistogramBin(
            bin_start=round(start, 2),
            bin_end=round(end, 2),
            bin_center=round(center, 2),
            count_a=int(counts_a[i]),
            count_b=int(counts_b[i]) if counts_b is not None else 0
        ))
    return bins_out
