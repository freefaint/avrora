import React, { useMemo } from 'react';

export const Arrow = ({ up, width, height, color }: { up?: boolean; width: number; height: number; color: string }) => {
  const xMultiplier = useMemo(() => width / (Math.PI / 2), [width]);
  const yMultiplier = useMemo(() => height / (Math.PI / 2), [height]);
  const ySinMultiplier = useMemo(() => (height === 5 ? 0 : yMultiplier), [yMultiplier]);

  const data = useMemo(() => {
    let data: string = '';

    const controls = [
      [0, 0],
      [0.512286623256592433, 0.512286623256592433],
      [1.002313685767898599, 1],
      [Math.PI / 2, 1],
    ];

    let controlStart = controls[0],
      control1 = controls[1],
      control2 = controls[2],
      controlEnd = controls[3],
      x: any,
      y: any,
      x1: any,
      y1: any,
      x2: any,
      y2: any,
      quarterX = controlEnd[0],
      startX = -(4 * quarterX),
      negateY = false;

    function negateYs() {
      if (negateY) {
        y = -y;
        y1 = -y1;
        y2 = -y2;
      }
    }

    for (x = startX; x < 6; ) {
      if (x === startX) {
        y = controlStart[1];
        x1 = x + control1[0];
        y1 = control1[1];

        negateYs();
        data =
          'M' +
          [x * xMultiplier, y * ySinMultiplier + (!ySinMultiplier ? 3 : 0)] +
          ' C' +
          [x1 * xMultiplier, y1 * ySinMultiplier + (!ySinMultiplier ? 3 : 0)] +
          ' ';
      } else {
        //x1/y1 are always "mirrors" of the previous x2/y2,
        //so we can use the simpler "S" syntax instead of a new "C":
        data += ' S';
      }

      //Going from y=0 to y=+-1:
      x2 = x + control2[0];
      y2 = control2[1];
      x += quarterX;
      y = controlEnd[1];
      negateYs();
      data +=
        [x2 * xMultiplier, y2 * ySinMultiplier + (!ySinMultiplier ? 3 : 0)] +
        ' ' +
        [x * xMultiplier, y * ySinMultiplier + (!ySinMultiplier ? 3 : 0)];

      //Going from y=+- back to y=0:
      x2 = x + quarterX - control1[0];
      y2 = control1[1];
      x += quarterX;
      y = controlStart[1];
      negateYs();
      data +=
        ' S' +
        [x2 * xMultiplier, y2 * ySinMultiplier + (!ySinMultiplier ? 3 : 0)] +
        ' ' +
        [x * xMultiplier, y * ySinMultiplier + (!ySinMultiplier ? 3 : 0)];

      negateY = !negateY;
    }

    return data;
  }, [xMultiplier, ySinMultiplier]);

  const offsetX = useMemo(() => (up ? 1 : -1) * Math.PI * xMultiplier, [up, xMultiplier]);
  const offsetY = useMemo(() => -1 * yMultiplier, [yMultiplier]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height === 5 ? 10 : height}
      viewBox={
        up
          ? `${offsetX / 2} ${offsetY - 5} ${Math.PI * xMultiplier + 12} ${yMultiplier * 2 + 6}`
          : `${offsetX / 2} ${offsetY - 1} ${Math.PI * xMultiplier + 12} ${yMultiplier * 2 + 6}`
      }
      preserveAspectRatio="none"
    >
      <g fill="none" stroke-width="2">
        <path style={{ stroke: color }} d={data} />
      </g>

      {up && (
        <>
          <polygon
            points={`${width + offsetX - 6},${offsetY - 5} ${width + offsetX + 14},${offsetY - 5} ${
              width + offsetX + 14
            },${offsetY + 5} ${width + offsetX - 6},${offsetY + 5}`}
            fill="#f2f6fa"
          />
          <polygon
            points={`${width + offsetX - 6},${offsetY - 5} ${width + offsetX + 13},${offsetY} ${width + offsetX - 6},${
              offsetY + 5
            }`}
            fill={color}
          />
        </>
      )}

      {!up && (
        <>
          <polygon
            points={`${width - 6},${-offsetY - 5} ${width + 14},${-offsetY - 5} ${width + 14},${-offsetY + 5} ${
              width - 6
            },${-offsetY + 5}`}
            fill="#f2f6fa"
          />
          <polygon
            points={`${width - 6},${-offsetY - 5} ${width + 13},${-offsetY} ${width + -6},${-offsetY + 5}`}
            fill={color}
          />
        </>
      )}
    </svg>
  );
};
