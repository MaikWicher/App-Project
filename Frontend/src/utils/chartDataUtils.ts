import type { ChartConfig } from "../types/visualization";

export const processChartData = (config: ChartConfig): ChartConfig => {
    if (!config || !config.series) {
        return { showLegend: false, sortByValue: false, categories: [], series: [] };
    }

    if (!config.sortByValue || config.series.length === 0) {
        return config;
    }

    // Sort based on the first series
    const firstSeriesData = config.series[0].data;

    // Create pairs of [index, value] to sort
    const indices = firstSeriesData.map((val, idx) => ({ idx, val }));

    // Sort indices by value ascending (smallest to largest)
    indices.sort((a, b) => a.val - b.val);

    // Reconstruct categories and series based on sorted indices
    const sortedCategories = indices.map(item => config.categories[item.idx]);

    const sortedSeries = config.series.map(series => ({
        ...series,
        data: indices.map(item => series.data[item.idx])
    }));

    return {
        ...config,
        categories: sortedCategories,
        series: sortedSeries
    };
};
