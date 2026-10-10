import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts/core";
import {
  BarChart,
  LineChart,
  PieChart,
  SankeyChart,
  HeatmapChart,
} from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { Download, Maximize2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDashboardLocale } from "@/components/dashboard/useDashboardLocale";
import { downloadBlob } from "./exports";
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  SankeyChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  CanvasRenderer,
]);
function ChartCanvas({ option, chartRef, onSelect, height = 280, title }) {
  const element = useRef(null);
  useEffect(() => {
    const chart = echarts.init(element.current, null, { renderer: "canvas" });
    chartRef.current = chart;
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(element.current);
    if (onSelect) chart.on("click", onSelect);
    return () => {
      observer.disconnect();
      chartRef.current = null;
      chart.dispose();
    };
  }, [chartRef, onSelect]);
  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option, chartRef]);
  return (
    <div
      ref={element}
      role="img"
      aria-label={title}
      className="w-full min-w-0"
      style={{ height }}
    />
  );
}
export default function ChartContainer({
  chartKey,
  option,
  empty,
  onSelect,
  wide = false,
  hint,
}) {
  const { t, direction } = useDashboardLocale();
  const chartRef = useRef(null);
  const enlargedRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const title = t(
    "dashboard." +
      (chartKey === "vehicleStatus" ? "vehicleStatusChart" : chartKey),
  );
  async function download() {
    const url = chartRef.current?.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#fff",
    });
    if (url) downloadBlob(await (await fetch(url)).blob(), chartKey + ".png");
  }
  return (
    <Card className={"min-w-0 p-5 shadow-sm " + (wide ? "lg:col-span-2" : "")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {hint && (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {hint}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("dashboard.downloadPng") + ": " + title}
            disabled={empty}
            onClick={download}
          >
            <Download className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("dashboard.enlarge") + ": " + title}
            disabled={empty}
            onClick={() => setExpanded(true)}
          >
            <Maximize2 className="size-4" />
          </Button>
        </div>
      </div>
      {empty ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
          {t("dashboard.empty")}
        </div>
      ) : (
        <ChartCanvas
          option={option}
          chartRef={chartRef}
          onSelect={onSelect}
          title={title}
          height={chartKey === "sankey" ? 330 : 280}
        />
      )}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent
          dir={direction}
          className="z-[11000] w-[min(1100px,calc(100vw-2rem))] sm:max-w-none"
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("dashboard.chartHint")}</DialogDescription>
          <ChartCanvas
            option={option}
            chartRef={enlargedRef}
            onSelect={onSelect}
            title={title}
            height={Math.min(520, window.innerHeight * 0.65)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
