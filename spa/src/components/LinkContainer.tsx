import React from 'react';
import PropTypes from 'prop-types';
import { useHref, useLocation, useMatch, useNavigate } from 'react-router';

/**
 * From https://github.com/react-bootstrap/react-router-bootstrap/blob/master/src/LinkContainer.js as it seems to be abandoned. Includes fix for react router v7 and TS type checking
 */

interface LinkContainerProps {
    children: React.ReactElement;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    replace?: boolean;
    to: string | { pathname: string };
    state?: object;
    activeClassName?: string;
    className?: string;
    activeStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    isActive?: ((match: ReturnType<typeof useMatch>, location: ReturnType<typeof useLocation>) => boolean) | boolean;
    [key: string]: unknown;
  }

const isModifiedEvent = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

const LinkContainer = ({
  children,
  onClick,
  replace = false,
  to,
  state,
  activeClassName = 'active',
  className,
  activeStyle,
  style,
  isActive: getIsActive,
  ...props
}: LinkContainerProps) => {
  const path = typeof to === 'object' ? to.pathname || '' : to;
  const navigate = useNavigate();
  const href = useHref(typeof to === 'string' ? { pathname: to } : to);
  const match = useMatch(path);
  const location = useLocation();
  const child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLAnchorElement>>;

  const isActive = !!(getIsActive
    ? typeof getIsActive === 'function'
      ? getIsActive(match, location)
      : getIsActive
    : match);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if ((children as React.ReactElement<React.HTMLAttributes<HTMLAnchorElement>>).props.onClick) {
      (children as React.ReactElement<React.HTMLAttributes<HTMLAnchorElement>>).props.onClick?.(event);
    }

    if (onClick) {
      onClick(event);
    }

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore right clicks
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();

      navigate(to, {
        replace,
        state,
      });
    }
  };

  return React.cloneElement(child, {
    ...props,
    className: [
      className,
      child.props.className,
      isActive ? activeClassName : null,
    ]
      .join(' ')
      .trim(),
    style: isActive ? { ...style, ...activeStyle } : style,
    ...(child.type === 'a' ? { href } : {}),
    onClick: handleClick,
  });
};

LinkContainer.propTypes = {
  children: PropTypes.element.isRequired,
  onClick: PropTypes.func,
  replace: PropTypes.bool,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  state: PropTypes.object,
  className: PropTypes.string,
  activeClassName: PropTypes.string,
  style: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ),
  activeStyle: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ),
  isActive: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
};

export default LinkContainer;