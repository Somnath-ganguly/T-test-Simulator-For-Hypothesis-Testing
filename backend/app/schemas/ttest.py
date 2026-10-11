from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

class TestType(str, Enum):
    __test__ = False  # Prevents pytest collection warning
    ONE_SAMPLE = "one_sample"
    INDEPENDENT = "independent"
    PAIRED = "paired"

class AlternativeHypothesis(str, Enum):
    TWO_SIDED = "two-sided"
    LESS = "less"
    GREATER = "greater"

class DataDistributionType(str, Enum):
    NORMAL = "normal"
    SKEWED = "skewed"
    T_DIST = "t_dist"
    UNIFORM = "uniform"

class GenerateDataRequest(BaseModel):
    test_type: TestType = TestType.ONE_SAMPLE
    n_a: int = Field(default=30, ge=3, le=5000)
    mean_a: float = Field(default=100.0)
    std_a: float = Field(default=15.0, gt=0)
    
    n_b: Optional[int] = Field(default=30, ge=3, le=5000)
    mean_b: Optional[float] = Field(default=105.0)
    std_b: Optional[float] = Field(default=15.0, gt=0)
    
    distribution: DataDistributionType = DataDistributionType.NORMAL
    correlation: Optional[float] = Field(default=0.5, ge=-0.99, le=0.99)
    seed: Optional[int] = Field(default=None)

class GenerateDataResponse(BaseModel):
    sample_a: List[float]
    sample_b: Optional[List[float]] = None
    seed: Optional[int] = None
    summary_a: Dict[str, float]
    summary_b: Optional[Dict[str, float]] = None

class TTestRequest(BaseModel):
    test_type: TestType = TestType.ONE_SAMPLE
    alternative: AlternativeHypothesis = AlternativeHypothesis.TWO_SIDED
    alpha: float = Field(default=0.05, gt=0.0, lt=0.5)
    mu_0: float = Field(default=0.0)
    equal_var: bool = Field(default=False)
    
    sample_a: List[float] = Field(..., min_length=2)
    sample_b: Optional[List[float]] = None
    
    label_a: Optional[str] = "Sample A"
    label_b: Optional[str] = "Sample B"

    @field_validator('sample_a', 'sample_b', mode='before')
    @classmethod
    def clean_samples(cls, v):
        if v is None:
            return None
        cleaned = []
        for x in v:
            if x is not None:
                try:
                    val = float(x)
                    if not (val != val):
                        cleaned.append(val)
                except (ValueError, TypeError):
                    continue
        return cleaned

class CurvePoint(BaseModel):
    x: float
    density: float
    is_critical: bool

class HistogramBin(BaseModel):
    bin_start: float
    bin_end: float
    bin_center: float
    count_a: int
    count_b: Optional[int] = 0

class InterpretationDetails(BaseModel):
    plain_english: str
    practical_vs_statistical: str
    causation_warning: str
    h0_truth_warning: str

class TTestResponse(BaseModel):
    test_type: TestType
    test_name: str
    alternative: AlternativeHypothesis
    alpha: float
    null_hypothesis: str
    alt_hypothesis: str
    
    t_statistic: float
    p_value: float
    df: float
    
    label_a: str
    label_b: Optional[str] = None
    
    n_a: int
    mean_a: float
    std_a: float
    sem_a: float
    
    n_b: Optional[int] = None
    mean_b: Optional[float] = None
    std_b: Optional[float] = None
    sem_b: Optional[float] = None
    
    diff_mean: float
    std_err: float
    conf_level: float
    ci_lower: float
    ci_upper: float
    
    cohens_d: float
    effect_size_label: str
    
    decision: str
    is_significant: bool
    
    normality_p_a: Optional[float] = None
    normality_p_b: Optional[float] = None
    levene_p: Optional[float] = None
    
    warnings: List[str]
    interpretation: InterpretationDetails
    
    distribution_curve: List[CurvePoint]
    histograms: List[HistogramBin]
    critical_value_low: Optional[float] = None
    critical_value_high: Optional[float] = None

class HealthResponse(BaseModel):
    status: str
    version: str
