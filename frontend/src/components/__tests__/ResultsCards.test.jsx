import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { ResultsCards } from '../ResultsCards';

describe('ResultsCards Component', () => {
  const mockResult = {
    t_statistic: 2.4567,
    p_value: 0.0198,
    df: 28.0,
    std_err: 0.8123,
    diff_mean: 2.15,
    conf_level: 0.95,
    ci_lower: 0.38,
    ci_upper: 3.92,
    cohens_d: 0.65,
    effect_size_label: 'Medium',
    is_significant: true,
    alpha: 0.05
  };

  it('renders t-statistic and p-value correctly', () => {
    render(<ResultsCards result={mockResult} />);
    
    expect(screen.getByText('2.4567')).toBeDefined();
    expect(screen.getByText('0.0198')).toBeDefined();
    expect(screen.getByText('Medium')).toBeDefined();
  });
});
