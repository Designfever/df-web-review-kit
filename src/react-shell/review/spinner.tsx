type ReviewSpinnerProps = {
  className?: string;
  label?: string;
};

export const ReviewSpinner = ({ className, label }: ReviewSpinnerProps) => (
  <span
    aria-hidden={label ? undefined : true}
    aria-label={label}
    className={`df-review-spinner${className ? ` ${className}` : ''}`}
    role={label ? 'status' : undefined}
  />
);
