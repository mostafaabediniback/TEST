// useQueries returns a new results array on React renders. Reuse the merged
// locations unless a tile's actual data changes, including hover/zoom renders.
export function createTileQueryCombiner(kind) {
  let previousData = [];
  let items = [];
  return (results) => {
    const data = results.map((result) => result.data);
    if (data.length !== previousData.length ||
      data.some((value, index) => value !== previousData[index])) {
      const byId = new Map();
      for (const tile of data) {
        const rows = Array.isArray(tile) ? tile : tile?.[kind] ?? tile?.items ?? [];
        for (const item of rows) {
          const id = kind === "ships" ? item.id ?? item.mmsi ?? item.imo : item.id;
          if (id != null) byId.set(String(id), item);
        }
      }
      items = [...byId.values()];
      previousData = data;
    }
    return {
      [kind]: items,
      isPending: results.some((result) => result.isPending),
      isFetching: results.some((result) => result.isFetching),
      isError: results.some((result) => result.isError),
      errors: results.filter((result) => result.error).map((result) => result.error),
    };
  };
}
