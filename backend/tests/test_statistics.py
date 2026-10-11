import pytest
import numpy as np
from scipy import stats
from app.schemas.ttest import TTestRequest, TestType, AlternativeHypothesis
from app.services.statistics import run_ttest_analysis

def test_one_sample_ttest_two_sided():
    sample_a = [10.2, 11.5, 9.8, 10.5, 11.0, 10.8, 12.0, 9.5, 10.1, 10.6]
    mu_0 = 10.0
    req = TTestRequest(
        test_type=TestType.ONE_SAMPLE,
        alternative=AlternativeHypothesis.TWO_SIDED,
        alpha=0.05,
        mu_0=mu_0,
        sample_a=sample_a
    )
    res = run_ttest_analysis(req)
    
    # SciPy direct reference calculation
    scipy_res = stats.ttest_1samp(sample_a, mu_0)
    
    assert res.t_statistic == pytest.approx(float(scipy_res.statistic), abs=1e-3)
    assert res.p_value == pytest.approx(float(scipy_res.pvalue), abs=1e-3)
    assert res.df == 9.0
    assert res.n_a == 10
    assert res.ci_lower < res.mean_a < res.ci_upper

def test_one_sample_ttest_greater():
    sample_a = [12.0, 14.5, 13.2, 15.0, 14.1]
    mu_0 = 10.0
    req = TTestRequest(
        test_type=TestType.ONE_SAMPLE,
        alternative=AlternativeHypothesis.GREATER,
        alpha=0.05,
        mu_0=mu_0,
        sample_a=sample_a
    )
    res = run_ttest_analysis(req)
    scipy_res = stats.ttest_1samp(sample_a, mu_0, alternative='greater')
    
    assert res.t_statistic == pytest.approx(float(scipy_res.statistic), abs=1e-3)
    assert res.p_value == pytest.approx(float(scipy_res.pvalue), abs=1e-3)
    assert res.is_significant is True
    assert res.decision == "Reject H₀"

def test_independent_welch_ttest():
    sample_a = [22.0, 24.5, 23.0, 25.1, 26.8]
    sample_b = [18.2, 19.5, 17.8, 20.1, 21.0, 19.0]
    req = TTestRequest(
        test_type=TestType.INDEPENDENT,
        alternative=AlternativeHypothesis.TWO_SIDED,
        alpha=0.05,
        equal_var=False,
        sample_a=sample_a,
        sample_b=sample_b
    )
    res = run_ttest_analysis(req)
    scipy_res = stats.ttest_ind(sample_a, sample_b, equal_var=False)
    
    assert res.t_statistic == pytest.approx(float(scipy_res.statistic), abs=1e-3)
    assert res.p_value == pytest.approx(float(scipy_res.pvalue), abs=1e-3)
    assert res.cohens_d > 0.8  # Large effect size

def test_independent_student_ttest():
    sample_a = [10, 12, 14, 16, 18]
    sample_b = [8, 10, 12, 14, 16]
    req = TTestRequest(
        test_type=TestType.INDEPENDENT,
        alternative=AlternativeHypothesis.TWO_SIDED,
        alpha=0.05,
        equal_var=True,
        sample_a=sample_a,
        sample_b=sample_b
    )
    res = run_ttest_analysis(req)
    scipy_res = stats.ttest_ind(sample_a, sample_b, equal_var=True)
    
    assert res.t_statistic == pytest.approx(float(scipy_res.statistic), abs=1e-3)
    assert res.p_value == pytest.approx(float(scipy_res.pvalue), abs=1e-3)
    assert res.df == 8.0

def test_paired_ttest():
    sample_a = [85.2, 89.4, 92.1, 78.5, 83.0]
    sample_b = [82.1, 86.0, 88.5, 76.2, 80.8]
    req = TTestRequest(
        test_type=TestType.PAIRED,
        alternative=AlternativeHypothesis.TWO_SIDED,
        alpha=0.05,
        sample_a=sample_a,
        sample_b=sample_b
    )
    res = run_ttest_analysis(req)
    scipy_res = stats.ttest_rel(sample_a, sample_b)
    
    assert res.t_statistic == pytest.approx(float(scipy_res.statistic), abs=1e-3)
    assert res.p_value == pytest.approx(float(scipy_res.pvalue), abs=1e-3)
    assert res.df == 4.0

def test_zero_variance_error():
    sample_a = [5.0, 5.0, 5.0, 5.0]
    req = TTestRequest(
        test_type=TestType.ONE_SAMPLE,
        sample_a=sample_a
    )
    with pytest.raises(ValueError, match="zero variance"):
        run_ttest_analysis(req)

def test_unmatched_paired_samples_error():
    sample_a = [1, 2, 3, 4]
    sample_b = [1, 2, 3]
    req = TTestRequest(
        test_type=TestType.PAIRED,
        sample_a=sample_a,
        sample_b=sample_b
    )
    with pytest.raises(ValueError, match="equal sample sizes"):
        run_ttest_analysis(req)
