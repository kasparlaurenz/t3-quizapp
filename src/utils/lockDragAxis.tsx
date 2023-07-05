export const getStyle = (style: any) => {
  if (style?.transform) {
    const axisLockY = `translate(0px, ${style.transform.split(",").pop()}`;
    return {
      ...style,
      transform: axisLockY,
    };
  }
  return style;
};
