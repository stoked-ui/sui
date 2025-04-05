/**
 * @typedef {object} FileOwnerState
 * @property {string} classes - CSS classes for the file owner
 */

/**
 * @typedef {object} FileContentProps
 * @property {UseFileStatus} status - Status of the file
 * @property {SxProps<Theme> | true} [alternatingRows] - Alternating row styles
 * @property {true} [indentationAtItemLevel] - Indentation at item level
 * @property {true} [first] - First item indicator
 * @property {boolean} [grid] - Grid layout indicator
 * @property {number} [visibleIndex] - Index of the visible file
 * @property {string} [id] - Unique identifier of the file
 */

/**
 * @description Root component for a file item.
 * @param {FileContentProps} props - Component props
 * @returns {JSX.Element}
 * @example
 * <FileContent status={fileStatus} alternatingRows={true} indentationAtItemLevel={true} />
 */
export const FileContent = styled('div', {
  name: 'MuiFile',
  slot: 'Content',
  overridesResolver: (props, styles) => styles.content,
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'status' &&
    prop !== 'indentationAtItemLevel' &&
    prop !== 'alternatingRows' &&
    prop !== 'grid' &&
    prop !== 'meta' &&
    prop !== 'last' &&
    prop !== 'first',
})<{
  status: UseFileStatus;
  alternatingRows?: SxProps<Theme> | true;
  indentationAtItemLevel?: true;
  first?: true;
  grid?: boolean;
  visibleIndex?: number;
  id?: string;
}>(({ theme, alternatingRows }) => {
  return {
    display: 'flex',
    borderRadius: theme.spacing(0.7),
    /*
    // gridTemplateColumns: `minmax(content, ${200 - (depth * indentPerLevel)}px) repeat(auto-fill, 100px)`,
    marginBottom: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    */
    // padding: theme.spacing(0.5),
    // paddingRight: theme.spacing(1),
    fontWeight: 500,

    [`&.Mui-expanded `]: {
      '&:not(.Mui-focused, .Mui-selected, .Mui-selected.Mui-focused) .labelIcon': {
        color:
          theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark,
      },
      '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        left: '16px',
        top: '44px',
        height: 'calc(100% - 48px)',
        width: '1.5px',
        backgroundColor:
          theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      },
    },
    '&.Mui-odd': alternatingRows,
    '&.Mui-focused': {
      backgroundColor: `${alpha(theme.palette.primary.light, 0.66)}!important`,
      color: `${theme.palette.primary.contrastText}!important`,
      '& .MuiTypography-body2': {
        color: `${theme.palette.primary.contrastText}!important`,
      },
    },
    '&.Mui-selected': {
      backgroundColor: `${theme.palette.primary.main}!important`,
      color: `${theme.palette.primary.contrastText}!important`,
      '& .MuiTypography-body2': {
        color: `${theme.palette.primary.contrastText}!important`,
      },
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.light, 0.2),
      color: theme.palette.mode === 'light' ? theme.palette.primary.main : 'white',
      '&.Mui-focused': {
        backgroundColor: `${alpha(theme.palette.primary.light, 0.46)}!important`,
      },
      '&.Mui-selected': {
        backgroundColor: `${alpha(theme.palette.primary.main, 0.8)}!important`,
      },
    },
    '&.can-not-drop': {
      backgroundColor: `${theme.palette.error.main}!important`,
      color: `${theme.palette.background.default}!important`,
      '& .cell p':{
        color: `${theme.palette.background.default}!important`,
      }
    },
    '&.can-drop': {
      backgroundColor: `${theme.palette.success.main}!important`,
      color: `${theme.palette.background.default}!important`,
      '& .cell p':{
        color: `${theme.palette.background.default}!important`,
      }
    },
    '&.can-not-drop-selected': {
      backgroundColor: theme.palette.mode === 'light' ? `${theme.palette.error.dark}!important` : `${theme.palette.error.light}!important`,
      color: `${theme.palette.background.default}!important`,
      '& .cell p':{
        color: `${theme.palette.background.default}!important`,
      }
    },
    '&.can-drop-selected': {
      backgroundColor: theme.palette.mode === 'light' ? `${theme.palette.success.dark}!important` : `${theme.palette.success.light}!important`,
      color: `${theme.palette.background.default}!important`,
      '& .cell p':{
        color: `${theme.palette.background.default}!important`,
      }
    },
    variants: [
      {
        props: { indentationAtItemLevel: true },
        style: {
          paddingLeft: `calc(${theme.spacing(1)} + var(--FileExplorer-itemChildrenIndentation) * var(--FileExplorer-itemDepth))`,
        },
      },
      {
        props: { meta: false },
        style: {
          borderRadius: theme.spacing(0.7),
        },
      },
      {
        props: { first: true },
        style: {
          borderTopRightRadius: 0,
          borderTopLeftRadius: 0,
        },
      },
      {
        props: { grid: true },
        style: {
          flexDirection: 'row-reverse',
        },
      },
      {
        props: { grid: false },
        style: {
          padding: '4px 8px 4px 4px',
        },
      },
    ],
  };
});

/**
 * @description Component for file item root.
 * @param {CheckboxProps & { visible: boolean }} props - Component props
 * @returns {JSX.Element}
 */
export const FileCheckbox = styled(
  React.forwardRef(
    (props: CheckboxProps & { visible: boolean }, ref: React.Ref<HTMLButtonElement>) => {
      const { visible, ...other } = props;
      if (!visible) {
        return null;
      }

      return <MuiCheckbox {...other} ref={ref} />;
    },
  ),
  {
    name: 'MuiFile',
    slot: 'Checkbox',
    overridesResolver: (props, styles) => styles.checkbox,
  },
)({
  padding: 0,
});

/**
 * @description Hook for utility classes related to the file component.
 * @param {FileOwnerState} ownerState - State of the file owner
 * @returns {string[]} - Array of utility classes
 */
export const useUtilityClasses = (ownerState: FileOwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    content: ['content'],
    expanded: ['expanded'],
    selected: ['selected'],
    focused: ['focused'],
    disabled: ['disabled'],
    iconContainer: ['iconContainer'],
    checkbox: ['checkbox'],
    name: ['name'],
    groupTransition: ['groupTransition'],
    grid: ['grid'],
  };

  return composeClasses(slots, getFileUtilityClass, classes);
};

/**
 * @description Component for file group transition.
 * @param {{ indentationAtItemLevel?: true }} props - Component props
 * @returns {JSX.Element}
 */
export const FileGroupTransition = styled(Collapse, {
  name: 'MuiFile',
  slot: 'GroupTransition',
  overridesResolver: (props, styles) => styles.groupTransition,
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'indentationAtItemLevel',
})<{ indentationAtItemLevel?: true }>({
  margin: 0,
  padding: 0,
  paddingLeft: 'var(--FileExplorer-itemChildrenIndentation)',
  variants: [
    {
      props: { indentationAtItemLevel: true },
      style: { paddingLeft: 0 },
    },
  ],
});

/**
 * @description Component for transitions in the file component.
 * @param {TransitionProps} props - Transition component props
 * @returns {JSX.Element}
 */
export function TransitionComponent(props: TransitionProps) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
    },
  });

  return <AnimatedCollapse style={style} {...props} />;
}
*/