from typing import Tuple, Dict, List
from app.schemas.ttest import TestType, AlternativeHypothesis, InterpretationDetails

def get_effect_size_label(cohens_d: float) -> str:
    abs_d = abs(cohens_d)
    if abs_d < 0.2:
        return "Negligible"
    elif abs_d < 0.5:
        return "Small"
    elif abs_d < 0.8:
        return "Medium"
    else:
        return "Large"

def format_hypotheses(
    test_type: TestType,
    alternative: AlternativeHypothesis,
    mu_0: float,
    label_a: str,
    label_b: str
) -> Tuple[str, str]:
    symbol_map = {
        AlternativeHypothesis.TWO_SIDED: "≠",
        AlternativeHypothesis.LESS: "<",
        AlternativeHypothesis.GREATER: ">"
    }
    alt_symbol = symbol_map[alternative]
    
    if test_type == TestType.ONE_SAMPLE:
        h0 = f"H₀: μ({label_a}) = {mu_0:.2f}"
        h1 = f"H₁: μ({label_a}) {alt_symbol} {mu_0:.2f}"
    elif test_type == TestType.INDEPENDENT:
        if mu_0 == 0:
            h0 = f"H₀: μ({label_a}) - μ({label_b}) = 0"
            h1 = f"H₁: μ({label_a}) - μ({label_b}) {alt_symbol} 0"
        else:
            h0 = f"H₀: μ({label_a}) - μ({label_b}) = {mu_0:.2f}"
            h1 = f"H₁: μ({label_a}) - μ({label_b}) {alt_symbol} {mu_0:.2f}"
    else: # PAIRED
        if mu_0 == 0:
            h0 = f"H₀: μ_d({label_a} - {label_b}) = 0"
            h1 = f"H₁: μ_d({label_a} - {label_b}) {alt_symbol} 0"
        else:
            h0 = f"H₀: μ_d({label_a} - {label_b}) = {mu_0:.2f}"
            h1 = f"H₁: μ_d({label_a} - {label_b}) {alt_symbol} {mu_0:.2f}"
            
    return h0, h1

def generate_interpretation(
    test_type: TestType,
    alternative: AlternativeHypothesis,
    alpha: float,
    t_stat: float,
    p_val: float,
    df: float,
    diff_mean: float,
    ci_lower: float,
    ci_upper: float,
    cohens_d: float,
    is_significant: bool,
    label_a: str,
    label_b: str,
    mu_0: float
) -> InterpretationDetails:
    
    effect_label = get_effect_size_label(cohens_d)
    
    if is_significant:
        decision_str = f"Reject H₀ at α = {alpha}."
        plain_english = (
            f"Because the calculated p-value ({p_val:.4f}) is less than the significance level α = {alpha}, "
            f"there is statistically significant evidence to reject the null hypothesis. "
            f"The observed sample mean difference of {diff_mean:.2f} (95% CI: [{ci_lower:.2f}, {ci_upper:.2f}]) "
            f"is unlikely to have occurred by random chance alone."
        )
    else:
        decision_str = f"Fail to reject H₀ at α = {alpha}."
        plain_english = (
            f"Because the calculated p-value ({p_val:.4f}) is greater than or equal to the significance level α = {alpha}, "
            f"there is not enough statistical evidence to reject the null hypothesis. "
            f"The observed difference of {diff_mean:.2f} could plausibly be due to random sample variation."
        )

    # Practical vs Statistical
    if is_significant:
        if abs(cohens_d) >= 0.5:
            practical = (
                f"The test result is both statistically significant (p = {p_val:.4f}) and practically meaningful, "
                f"with a {effect_label.lower()} effect size (Cohen's d = {cohens_d:.2f})."
            )
        else:
            practical = (
                f"Although the result is statistically significant (p = {p_val:.4f}), the effect size is {effect_label.lower()} "
                f"(Cohen's d = {cohens_d:.2f}). In large samples, even tiny trivial differences can become statistically significant."
            )
    else:
        practical = (
            f"The test did not achieve statistical significance (p = {p_val:.4f}). "
            f"The estimated effect size is {effect_label.lower()} (Cohen's d = {cohens_d:.2f})."
        )
        
    causation_warning = (
        "Statistical significance demonstrates an association or difference between sample metrics, "
        "but it CANNOT establish a cause-and-effect relationship without random assignment and strict experimental controls."
    )
    
    h0_truth_warning = (
        "Failing to reject H₀ does NOT prove that H₀ is true (absence of evidence is not evidence of absence). "
        "It simply means the current sample size or data variability did not provide sufficient evidence to rule out H₀."
    )
    
    return InterpretationDetails(
        plain_english=plain_english,
        practical_vs_statistical=practical,
        causation_warning=causation_warning,
        h0_truth_warning=h0_truth_warning
    )
