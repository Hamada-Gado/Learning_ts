export interface ValidateConfig {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

export function validate(input: ValidateConfig) {
    if (
        (input.required && input.value.toString().trim().length === 0) ||
        (input.minLength != null &&
            input.value.toString().length < input.minLength) ||
        (input.maxLength != null &&
            input.value.toString().length > input.maxLength) ||
        (input.min != null && +input.value < input.min) ||
        (input.max != null && +input.value > input.max)
    ) {
        return false;
    }

    return true;
}
