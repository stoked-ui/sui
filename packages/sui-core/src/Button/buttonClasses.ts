import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
import generateUtilityClass from '@mui/utils/generateUtilityClass';

export interface ButtonClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `variant="text"`. */
  text: string;
  /** Styles applied to the root element if `variant="text"` and `color="inherit"`.
   * @deprecated Combine the [.SuiButton-text](/material-ui/api/button/#button-classes-text) and [.SuiButton-colorInherit](/material-ui/api/button/#button-classes-colorInherit) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  textInherit: string;
  /** Styles applied to the root element if `variant="text"` and `color="primary"`.
   * @deprecated Combine the [.SuiButton-text](/material-ui/api/button/#button-classes-text) and [.SuiButton-colorPrimary](/material-ui/api/button/#button-classes-colorPrimary) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  textPrimary: string;
  /** Styles applied to the root element if `variant="text"` and `color="secondary"`.
   * @deprecated Combine the [.SuiButton-text](/material-ui/api/button/#button-classes-text) and [.SuiButton-colorSecondary](/material-ui/api/button/#button-classes-colorSecondary) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  textSecondary: string;
  /** Styles applied to the root element if `variant="text"` and `color="success"`.
   * @deprecated Combine the [.SuiButton-text](/material-ui/api/button/#button-classes-text) and [.SuiButton-colorSuccess](/material-ui/api/button/#button-classes-colorSuccess) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  textSuccess: string;
  /** Styles applied to the root element if `variant="text"` and `color="error"`.
   * @deprecated Combine the [.SuiButton-text](/material-ui/api/button/#button-classes-text) and [.SuiButton-colorError](/material-ui/api/button/#button-classes-colorError) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  textError: string;
  /** Styles applied to the root element if `variant="text"` and `color="info"`.
   * @deprecated Combine the [.SuiButton-text](/material-ui/api/button/#button-classes-text) and [.SuiButton-colorInfo](/material-ui/api/button/#button-classes-colorInfo) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  textInfo: string;
  /** Styles applied to the root element if `variant="text"` and `color="warning"`.
   * @deprecated Combine the [.SuiButton-text](/material-ui/api/button/#button-classes-text) and [.SuiButton-colorWarning](/material-ui/api/button/#button-classes-colorWarning) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  textWarning: string;
  /** Styles applied to the root element if `variant="outlined"`. */
  outlined: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="inherit"`.
   * @deprecated Combine the [.SuiButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.SuiButton-colorInherit](/material-ui/api/button/#button-classes-colorInherit) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  outlinedInherit: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="primary"`.
   * @deprecated Combine the [.SuiButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.SuiButton-colorPrimary](/material-ui/api/button/#button-classes-colorPrimary) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  outlinedPrimary: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="secondary"`.
   * @deprecated Combine the [.SuiButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.SuiButton-colorSecondary](/material-ui/api/button/#button-classes-colorSecondary) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  outlinedSecondary: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="success"`.
   * @deprecated Combine the [.SuiButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.SuiButton-colorSuccess](/material-ui/api/button/#button-classes-colorSuccess) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  outlinedSuccess: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="error"`.
   * @deprecated Combine the [.SuiButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.SuiButton-colorError](/material-ui/api/button/#button-classes-colorError) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  outlinedError: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="info"`.
   * @deprecated Combine the [.SuiButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.SuiButton-colorInfo](/material-ui/api/button/#button-classes-colorInfo) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  outlinedInfo: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="warning"`.
   * @deprecated Combine the [.SuiButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.SuiButton-colorWarning](/material-ui/api/button/#button-classes-colorWarning) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  outlinedWarning: string;
  /** Styles applied to the root element if `variant="contained"`. */
  contained: string;
  /** Styles applied to the root element if `variant="contained"` and `color="inherit"`.
   * @deprecated Combine the [.SuiButton-contained](/material-ui/api/button/#button-classes-contained) and [.SuiButton-colorInherit](/material-ui/api/button/#button-classes-colorInherit) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  containedInherit: string;
  /** Styles applied to the root element if `variant="contained"` and `color="primary"`.
   * @deprecated Combine the [.SuiButton-contained](/material-ui/api/button/#button-classes-contained) and [.SuiButton-colorPrimary](/material-ui/api/button/#button-classes-colorPrimary) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  containedPrimary: string;
  /** Styles applied to the root element if `variant="contained"` and `color="secondary"`.
   * @deprecated Combine the [.SuiButton-contained](/material-ui/api/button/#button-classes-contained) and [.SuiButton-colorSecondary](/material-ui/api/button/#button-classes-colorSecondary) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  containedSecondary: string;
  /** Styles applied to the root element if `variant="contained"` and `color="success"`.
   * @deprecated Combine the [.SuiButton-contained](/material-ui/api/button/#button-classes-contained) and [.SuiButton-colorSuccess](/material-ui/api/button/#button-classes-colorSuccess) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  containedSuccess: string;
  /** Styles applied to the root element if `variant="contained"` and `color="info"`.
   * @deprecated Combine the [.SuiButton-contained](/material-ui/api/button/#button-classes-contained) and [.SuiButton-colorInfo](/material-ui/api/button/#button-classes-colorInfo) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  containedInfo: string;
  /** Styles applied to the root element if `variant="contained"` and `color="error"`.
   * @deprecated Combine the [.SuiButton-contained](/material-ui/api/button/#button-classes-contained) and [.SuiButton-colorError](/material-ui/api/button/#button-classes-colorError) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  containedError: string;
  /** Styles applied to the root element if `variant="contained"` and `color="warning"`.
   * @deprecated Combine the [.SuiButton-contained](/material-ui/api/button/#button-classes-contained) and [.SuiButton-colorWarning](/material-ui/api/button/#button-classes-colorWarning) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  containedWarning: string;
  /** Styles applied to the root element if `disableElevation={true}`. */
  disableElevation: string;
  /** State class applied to the ButtonBase root element if the button is keyboard focused. */
  focusVisible: string;
  /** State class applied to the root element if `disabled={true}`. */
  disabled: string;
  /** Styles applied to the root element if `color="inherit"`. */
  colorInherit: string;
  /** Styles applied to the root element if `size="small"` and `variant="text"`.
   * @deprecated Combine the [.SuiButton-sizeSmall](/material-ui/api/button/#button-classes-sizeSmall) and [.SuiButton-text](/material-ui/api/button/#button-classes-text) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  textSizeSmall: string;
  /** Styles applied to the root element if `size="medium"` and `variant="text"`.
   * @deprecated Combine the [.SuiButton-sizeMedium](/material-ui/api/button/#button-classes-sizeMedium) and [.SuiButton-text](/material-ui/api/button/#button-classes-text) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  textSizeMedium: string;
  /** Styles applied to the root element if `size="large"` and `variant="text"`.
   * @deprecated Combine the [.SuiButton-sizeLarge](/material-ui/api/button/#button-classes-sizeLarge) and [.SuiButton-text](/material-ui/api/button/#button-classes-text) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  textSizeLarge: string;
  /** Styles applied to the root element if `size="small"` and `variant="outlined"`.
   * @deprecated Combine the [.SuiButton-sizeSmall](/material-ui/api/button/#button-classes-sizeSmall) and [.SuiButton-outlined](/material-ui/api/button/#button-classes-outlined) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  outlinedSizeSmall: string;
  /** Styles applied to the root element if `size="medium"` and `variant="outlined"`.
   * @deprecated Combine the [.SuiButton-sizeMedium](/material-ui/api/button/#button-classes-sizeMedium) and [.SuiButton-outlined](/material-ui/api/button/#button-classes-outlined) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  outlinedSizeMedium: string;
  /** Styles applied to the root element if `size="large"` and `variant="outlined"`.
   * @deprecated Combine the [.SuiButton-sizeLarge](/material-ui/api/button/#button-classes-sizeLarge) and [.SuiButton-outlined](/material-ui/api/button/#button-classes-outlined) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  outlinedSizeLarge: string;
  /** Styles applied to the root element if `size="small"` and `variant="contained"`.
   * @deprecated Combine the [.SuiButton-sizeSmall](/material-ui/api/button/#button-classes-sizeSmall) and [.SuiButton-contained](/material-ui/api/button/#button-classes-contained) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  containedSizeSmall: string;
  /** Styles applied to the root element if `size="medium"` and `variant="contained"`.
   * @deprecated Combine the [.SuiButton-sizeMedium](/material-ui/api/button/#button-classes-sizeMedium) and [.SuiButton-contained](/material-ui/api/button/#button-classes-contained) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  containedSizeMedium: string;
  /** Styles applied to the root element if `size="large"` and `variant="contained"`.
   * @deprecated Combine the [.SuiButton-sizeLarge](/material-ui/api/button/#button-classes-sizeLarge) and [.SuiButton-contained](/material-ui/api/button/#button-classes-contained) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  containedSizeLarge: string;
  /** Styles applied to the root element if `size="small"`. */
  sizeSmall: string;
  /** Styles applied to the root element if `size="medium"`. */
  sizeMedium: string;
  /** Styles applied to the root element if `size="large"`. */
  sizeLarge: string;
  /** Styles applied to the root element if `fullWidth={true}`. */
  fullWidth: string;
  /** Styles applied to the icon element if supplied */
  icon: string;
  /** Styles applied to the startIcon element if supplied. */
  startIcon: string;
  /** Styles applied to the endIcon element if supplied. */
  endIcon: string;
  /** Styles applied to the icon element if supplied and `size="small"`.
   * @deprecated Combine the [.SuiButton-icon](/material-ui/api/button/#button-classes-icon) and [.SuiButtonSizeSmall](/material-ui/api/button/#button-classes-sizeSmall) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  iconSizeSmall: string;
  /** Styles applied to the icon element if supplied and `size="medium"`.
   * @deprecated Combine the [.SuiButton-icon](/material-ui/api/button/#button-classes-icon) and [.SuiButtonSizeMedium](/material-ui/api/button/#button-classes-sizeMedium) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  iconSizeMedium: string;
  /** Styles applied to the icon element if supplied and `size="large"`.
   * @deprecated Combine the [.SuiButton-icon](/material-ui/api/button/#button-classes-icon) and [.SuiButtonSizeLarge](/material-ui/api/button/#button-classes-sizeLarge) classes instead. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  iconSizeLarge: string;
  /** Styles applied to the root element if `color="primary"`. */
  colorPrimary: string;
  /** Styles applied to the root element if `color="secondary"`. */
  colorSecondary: string;
  /** Styles applied to the root element if `color="success"`. */
  colorSuccess: string;
  /** Styles applied to the root element if `color="error"`. */
  colorError: string;
  /** Styles applied to the root element if `color="info"`. */
  colorInfo: string;
  /** Styles applied to the root element if `color="warning"`. */
  colorWarning: string;
}

export type ButtonClassKey = keyof ButtonClasses;

export function getButtonUtilityClass(slot: string): string {
  return generateUtilityClass('SuiButton', slot);
}

const buttonClasses: ButtonClasses = generateUtilityClasses('SuiButton', [
  'root',
  'text',
  'textInherit',
  'textPrimary',
  'textSecondary',
  'textSuccess',
  'textError',
  'textInfo',
  'textWarning',
  'outlined',
  'outlinedInherit',
  'outlinedPrimary',
  'outlinedSecondary',
  'outlinedSuccess',
  'outlinedError',
  'outlinedInfo',
  'outlinedWarning',
  'contained',
  'containedInherit',
  'containedPrimary',
  'containedSecondary',
  'containedSuccess',
  'containedError',
  'containedInfo',
  'containedWarning',
  'disableElevation',
  'focusVisible',
  'disabled',
  'colorInherit',
  'colorPrimary',
  'colorSecondary',
  'colorSuccess',
  'colorError',
  'colorInfo',
  'colorWarning',
  'textSizeSmall',
  'textSizeMedium',
  'textSizeLarge',
  'outlinedSizeSmall',
  'outlinedSizeMedium',
  'outlinedSizeLarge',
  'containedSizeSmall',
  'containedSizeMedium',
  'containedSizeLarge',
  'sizeMedium',
  'sizeSmall',
  'sizeLarge',
  'fullWidth',
  'startIcon',
  'endIcon',
  'icon',
  'iconSizeSmall',
  'iconSizeMedium',
  'iconSizeLarge',
]);

export default buttonClasses;
