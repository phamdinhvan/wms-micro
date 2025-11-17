export class ValidateUtils {
  private static readonly VALID_SYMBOLS = '-_';

  static validateCode(
    code?: string,
    validSymbols: string = this.VALID_SYMBOLS,
  ): boolean {
    if (!code) return false;
    const validPattern = new RegExp(`^[A-Za-z0-9${validSymbols}]+$`);
    return validPattern.test(code);
  }

  static checkRequiredFieldsFilled = (
    formData: Record<string, any>,
    requiredFields: (string | string[])[],
  ): boolean => {
    return requiredFields.every(field => {
      if (Array.isArray(field)) {
        const [mainField, subField] = field;
        const mainValue = formData[mainField];
        if (Array.isArray(mainValue)) {
          return mainValue.some(
            item =>
              item[subField] !== null &&
              item[subField] !== undefined &&
              item[subField] !== '',
          );
        }
        return false;
      }

      return (
        formData[field] !== null &&
        formData[field] !== '' &&
        formData[field] !== undefined
      );
    });
  };
}
