import numpy as np
from typing import Tuple, Optional, Dict, Any
from app.schemas.ttest import DataDistributionType

def calculate_summary(data: np.ndarray) -> Dict[str, float]:
    return {
        "count": int(len(data)),
        "mean": float(np.mean(data)),
        "std": float(np.std(data, ddof=1)) if len(data) > 1 else 0.0,
        "min": float(np.min(data)),
        "q25": float(np.percentile(data, 25)),
        "median": float(np.median(data)),
        "q75": float(np.percentile(data, 75)),
        "max": float(np.max(data))
    }

def generate_sample(
    n: int,
    mean: float,
    std: float,
    distribution: DataDistributionType = DataDistributionType.NORMAL,
    rng: Optional[np.random.Generator] = None
) -> np.ndarray:
    if rng is None:
        rng = np.random.default_rng()
        
    if distribution == DataDistributionType.NORMAL:
        raw = rng.standard_normal(size=n)
    elif distribution == DataDistributionType.SKEWED:
        # Exponential distribution centered and scaled
        raw = rng.exponential(scale=1.0, size=n) - 1.0
    elif distribution == DataDistributionType.T_DIST:
        # Student's t distribution with df=4 (heavy-tailed)
        raw = rng.standard_t(df=4, size=n)
    elif distribution == DataDistributionType.UNIFORM:
        raw = rng.uniform(low=-np.sqrt(3), high=np.sqrt(3), size=n)
    else:
        raw = rng.standard_normal(size=n)
        
    # Scale to desired std and mean
    current_std = np.std(raw, ddof=1) if n > 1 else 1.0
    if current_std == 0:
        current_std = 1.0
    normalized = (raw - np.mean(raw)) / current_std
    data = mean + normalized * std
    return data

def generate_dataset(
    test_type: str,
    n_a: int,
    mean_a: float,
    std_a: float,
    n_b: Optional[int] = None,
    mean_b: Optional[float] = None,
    std_b: Optional[float] = None,
    distribution: DataDistributionType = DataDistributionType.NORMAL,
    correlation: float = 0.5,
    seed: Optional[int] = None
) -> Tuple[np.ndarray, Optional[np.ndarray], Dict[str, float], Optional[Dict[str, float]], Optional[int]]:
    
    if seed is not None:
        rng = np.random.default_rng(seed)
    else:
        seed = int(np.random.randint(1, 1_000_000))
        rng = np.random.default_rng(seed)
        
    sample_a = generate_sample(n_a, mean_a, std_a, distribution, rng)
    summary_a = calculate_summary(sample_a)
    
    sample_b = None
    summary_b = None
    
    if test_type in ["independent", "paired"]:
        nb = n_b if n_b is not None else n_a
        mb = mean_b if mean_b is not None else mean_a + 5.0
        sb = std_b if std_b is not None else std_a
        
        if test_type == "paired":
            # For paired samples, generate correlated noise
            # Correlated bivariate normal: Z2 = r * Z1 + sqrt(1 - r^2) * Z_independent
            # generate sample A standard
            z1 = (sample_a - mean_a) / (std_a if std_a > 0 else 1.0)
            z_ind = rng.standard_normal(size=n_a)
            r = max(-0.99, min(0.99, correlation))
            z2 = r * z1 + np.sqrt(1 - r**2) * z_ind
            # rescale z2
            sample_b = mb + z2 * sb
        else:
            sample_b = generate_sample(nb, mb, sb, distribution, rng)
            
        summary_b = calculate_summary(sample_b)
        
    return sample_a, sample_b, summary_a, summary_b, seed
