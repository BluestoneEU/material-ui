import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import transitions from '../styles/transitions';
import DropDownArrow from '../svg-icons/navigation/arrow-drop-down';
import Menu from '../Menu/Menu';
import ClearFix from '../internal/ClearFix';
import Popover from '../Popover/Popover';
import PopoverAnimationVertical from '../Popover/PopoverAnimationVertical';
import keycode from 'keycode';
import Events from '../utils/events';
import IconButton from '../IconButton/IconButton';

const anchorOrigin = {
  vertical: 'top',
  horizontal: 'left',
};

function getStyles(props, context) {
  const {disabled} = props;
  const spacing = context.muiTheme.baseTheme.spacing;
  const palette = context.muiTheme.baseTheme.palette;
  const accentColor = context.muiTheme.dropDownMenu.accentColor;
  return {
    control: {
      cursor: disabled ? 'not-allowed' : 'pointer',
      height: '100%',
      position: 'relative',
      width: '100%',
    },
    icon: {
      fill: accentColor,
      position: 'absolute',
      right: spacing.desktopGutterLess,
      top: ((spacing.iconSize - 24) / 2) + spacing.desktopGutterMini / 2,
    },
    label: {
      color: disabled ? palette.disabledColor : palette.textColor,
      lineHeight: `${spacing.desktopToolbarHeight}px`,
      opacity: 1,
      position: 'relative',
      paddingLeft: spacing.desktopGutter,
      paddingRight: (spacing.iconSize * 2) + spacing.desktopGutterMini,
      top: 0,
    },
    labelWhenOpen: {
      opacity: 0,
      top: (spacing.desktopToolbarHeight / 8),
    },
    root: {
      display: 'inline-block',
      fontSize: spacing.desktopDropDownMenuFontSize,
      height: spacing.desktopSubheaderHeight,
      fontFamily: context.muiTheme.baseTheme.fontFamily,
      outline: 'none',
      position: 'relative',
      transition: transitions.easeOut(),
    },
    rootWhenOpen: {
      opacity: 1,
    },
    underline: {
      borderTop: `solid 1px ${accentColor}`,
      bottom: 1,
      left: 0,
      margin: `-1px ${spacing.desktopGutter}px`,
      right: 0,
      position: 'absolute',
    },
  };
}

class DropDownMenu extends Component {
  static muiName = 'DropDownMenu';

  // The nested styles for drop-down-menu are modified by toolbar and possibly
  // other user components, so it will give full access to its js styles rather
  // than just the parent.
  static propTypes = {
    /**
     * If true, the popover will apply transitions when
     * it gets added to the DOM.
     */
    animated: PropTypes.bool,
    /**
     * Override the default animation component used.
     */
    animation: PropTypes.func,
    /**
     * The width will automatically be set according to the items inside the menu.
     * To control this width in css instead, set this prop to `false`.
     */
    autoWidth: PropTypes.bool,
    /**
     * The `MenuItem`s to populate the `Menu` with. If the `MenuItems` have the
     * prop `label` that value will be used to render the representation of that
     * item within the field.
     */
    children: PropTypes.node,
    /**
     * The css class name of the root element.
     */
    className: PropTypes.string,
    /**
     * Disables the menu.
     */
    disabled: PropTypes.bool,
    /**
     * Overrides the styles of icon element.
     */
    iconStyle: PropTypes.object,
    /**
     * Overrides the styles of label when the `DropDownMenu` is inactive.
     */
    labelStyle: PropTypes.object,
    /**
     * The style object to use to override underlying list style.
     */
    listStyle: PropTypes.object,
    /**
     * The maximum height of the `Menu` when it is displayed.
     */
    maxHeight: PropTypes.number,
    /**
     * Overrides the styles of `Menu` when the `DropDownMenu` is displayed.
     */
    menuStyle: PropTypes.object,
    /**
     * Callback function fired when a menu item is clicked, other than the one currently selected.
     *
     * @param {object} event TouchTap event targeting the menu item that was clicked.
     * @param {number} key The index of the clicked menu item in the `children` collection.
     * @param {any} payload The `value` prop of the clicked menu item.
     */
    onChange: PropTypes.func,
    /**
     * Set to true to have the `DropDownMenu` automatically open on mount.
     */
    openImmediately: PropTypes.bool,
    /**
     * Override the inline-styles of the root element.
     */
    style: PropTypes.object,
    /**
     * Overrides the inline-styles of the underline.
     */
    underlineStyle: PropTypes.object,
    /**
     * The value that is currently selected.
     */
    value: PropTypes.any,
  };

  static defaultProps = {
    animated: true,
    autoWidth: true,
    disabled: false,
    openImmediately: false,
    maxHeight: 500,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    open: false,
  };

  componentDidMount() {
    if (this.props.autoWidth) {
      this.setWidth();
    }
    if (this.props.openImmediately) {
      // TODO: Temporary fix to make openImmediately work with popover.
      /* eslint-disable react/no-did-mount-set-state */
      setTimeout(() => this.setState({open: true, anchorEl: this.refs.root}));
      setTimeout(() => this.setState({
        open: true,
        anchorEl: this.refs.root,
      }), 0);
      /* eslint-enable react/no-did-mount-set-state */
    }
  }

  componentWillReceiveProps() {
    if (this.props.autoWidth) {
      this.setWidth();
    }
  }

  /**
   * This method is deprecated but still here because the TextField
   * need it in order to work. TODO: That will be addressed later.
   */
  getInputNode() {
    const root = this.refs.root;

    root.focus = () => {
      if (!this.props.disabled) {
        this.setState({
          open: !this.state.open,
          anchorEl: this.refs.root,
        });
      }
    };

    return root;
  }

  setWidth() {
    const el = this.refs.root;
    if (!this.props.style || !this.props.style.hasOwnProperty('width')) {
      el.style.width = 'auto';
    }
  }

  handleTouchTapControl = (event) => {
    event.preventDefault();
    if (!this.props.disabled) {
      this.setState({
        open: !this.state.open,
        anchorEl: this.refs.root,
      });
    }
  };

  handleRequestCloseMenu = () => {
    this.close(false);
  };

  handleFocus = (event) => {
    // this is a work-around for SelectField losing keyboard focus
    // because the containing TextField re-renders
    if (event) event.stopPropagation();
  }

  handleBlur = (event) => {
    if (event) event.stopPropagation();
  }

  handleEscKeyDownMenu = (event) => {
    event.preventDefault();
    this.close(true);
  };

  handleKeyDown = (event) => {
    const key = keycode(event);
    switch (key) {
      case 'down':
      case 'space':
        event.preventDefault();
        this.setState({
          open: true,
          anchorEl: this.refs.root,
        });
        break;
    }
  };

  handleItemTouchTap = (event, child, index) => {
    event.persist();
    event.preventDefault();
    this.setState({
      open: false,
    }, () => {
      if (this.props.onChange) {
        this.props.onChange(event, index, child.props.value);
      }
      this.close(Events.isKeyboard(event));
    });
  };

  close = (isKeyboard) => {
    this.setState({open: false}, () => {
      if (isKeyboard) {
        const dropArrow = this.refs.dropArrow;
        const dropNode = ReactDOM.findDOMNode(dropArrow);
        dropNode.focus();
        dropArrow.setKeyboardFocus(true);
      }
    });
  }

  render() {
    const {
      animated,
      animation,
      autoWidth,
      children,
      className,
      iconStyle,
      labelStyle,
      listStyle,
      maxHeight,
      menuStyle: menuStyleProp,
      openImmediately, // eslint-disable-line no-unused-vars
      style,
      underlineStyle,
      value,
      ...other,
    } = this.props;

    const {
      anchorEl,
      open,
    } = this.state;

    const {prepareStyles} = this.context.muiTheme;
    const styles = getStyles(this.props, this.context);

    let displayValue = '';
    React.Children.forEach(children, (child) => {
      if (value === child.props.value) {
        // This will need to be improved (in case primaryText is a node)
        displayValue = child.props.label || child.props.primaryText;
      }
    });

    let menuStyle;
    if (anchorEl && !autoWidth) {
      menuStyle = Object.assign({
        width: anchorEl.clientWidth,
      }, menuStyleProp);
    } else {
      menuStyle = menuStyleProp;
    }

    return (
      <div
        {...other}
        ref="root"
        className={className}
        style={prepareStyles(Object.assign({}, styles.root, open && styles.rootWhenOpen, style))}
      >
        <ClearFix style={styles.control} onTouchTap={this.handleTouchTapControl}>
          <div style={prepareStyles(Object.assign({}, styles.label, open && styles.labelWhenOpen, labelStyle))}>
            {displayValue}
          </div>
          <IconButton
            centerRipple={true}
            tabIndex={this.props.disabled ? -1 : 0}
            onKeyDown={this.handleKeyDown}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            ref="dropArrow"
            style={Object.assign({}, styles.icon, iconStyle)}
          >
            <DropDownArrow />
          </IconButton>
          <div style={prepareStyles(Object.assign({}, styles.underline, underlineStyle))} />
        </ClearFix>
        <Popover
          anchorOrigin={anchorOrigin}
          anchorEl={anchorEl}
          animation={animation || PopoverAnimationVertical}
          open={open}
          animated={animated}
          onRequestClose={this.handleRequestCloseMenu}
        >
          <Menu
            maxHeight={maxHeight}
            desktop={true}
            value={value}
            onEscKeyDown={this.handleEscKeyDownMenu}
            style={menuStyle}
            listStyle={listStyle}
            onItemTouchTap={this.handleItemTouchTap}
          >
            {children}
          </Menu>
        </Popover>
      </div>
    );
  }
}

export default DropDownMenu;
