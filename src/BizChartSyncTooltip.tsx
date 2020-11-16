import isEqual from "lodash.isequal";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef,
} from "react";
import { G2 } from "bizcharts";

type ChartType = G2.Chart;

const chartGroupContext = createContext<ChartType[] | null>(null);

export const BizChartGroupProvider = function (props: PropsWithChildren<{}>) {
  const ref = useRef<ChartType[]>([]);

  return (
    <chartGroupContext.Provider value={ref.current}>
      {props.children}
    </chartGroupContext.Provider>
  );
};

export const useBizChartSyncTooltipProps = () => {
  const instances = useContext(chartGroupContext);
  const currentRef = useRef<ChartType | null>(null);

  const onGetG2Instance = useCallback(
    (target: ChartType) => {
      if (instances === null) {
        currentRef.current = target;

        return;
      }

      instances.push(target);
    },
    [instances]
  );

  const onPlotMove = useCallback(
    (ev: any) => {
      if (instances === null) {
        currentRef.current?.showTooltip(ev);

        return;
      }
      const [point] = ev.views[0]?.getSnapRecords(ev) || [];

      instances.forEach((chart, index) => {
        try {
          // chart 是否存在
          if (chart?.get("data")) {
            // 鼠标移入的chart不需要手动showTooltip, 解决当前移入chart的tooltip抖动问题
            if (!isEqual(ev.views[0], chart)) {
              // chart所有原数据
              const data = chart
                ?.get("data")
                ?.filter((item: any) => item.time === point?._origin.time);

              // 获取鼠标对应的坐标点的元数据
              const position = data?.find(
                (item: any) => item.time === point?._origin.time
              );

              if (position) {
                /**
                 * getXY ts定义有问题 所以ignore
                 * getXY 传递数据点获取准确的tooltip显示的坐标
                 */
                // @ts-ignore
                chart.showTooltip(chart.getXY(position));
              } else {
                instances.splice(index, 1);
              }
            }
          } else {
            instances.splice(index, 1);
          }
        } catch (error) {
          console.log("onPlotMove", chart, error);
        }
      });
    },
    [instances]
  );

  const onPlotLeave = useCallback(() => {
    if (instances === null) {
      currentRef.current?.hideTooltip();

      return;
    }

    instances.forEach((chart, index) => {
      try {
        if (chart && chart?.get("data") && chart.hideTooltip) {
          chart.hideTooltip();
        } else {
          instances.splice(index, 1);
        }
      } catch (error) {
        console.log("onPlotLeave", chart, error);
      }
    });
  }, [instances]);

  return {
    onPlotMove,
    onPlotLeave,
    onGetG2Instance,
  };
};
