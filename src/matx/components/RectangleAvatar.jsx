/* eslint-disable react/prop-types */
import React from 'react';
import { Icon } from '@material-ui/core';

const RectangleAvatar = ({
  color = 'primary', icon, textIcon, style,
}) => (
  <div
    className={`rectangle-box bg-light-${color} flex justify-center items-center`}
    style={style}
  >
    {textIcon ? (
      <h5 className={`font-medium m-0 text-${color}`}>{textIcon}</h5>
    ) : (
      <Icon className={`text-${color}`}>{icon}</Icon>
    )}
  </div>
);

export default RectangleAvatar;
