import { TableView } from "@src/packages/ui/TableView";
import { ViewerPlaceholder } from "../ViewerPlaceholder";
import { KeyValueRenderer } from "../KeyValueRenderer";

export const FormURLEncodedView = ({ params }: { params: { key: string; value: string | string[] }[] }) => {
  if (!params || params.length === 0) {
    return (
      <ViewerPlaceholder
        title="No Form Data Detected"
        subtext="This request body doesn't appear to be application/x-www-form-urlencoded. If this is a custom encoding, you can build a viewer for it."
        type="Form"
        hint="Use the Custom Viewer Builder to parse unique form structures or non-standard payloads."
      />
    );
  }

  // Flatten params if any value is an array
  const flattenedParams = params.flatMap(param =>
    Array.isArray(param.value)
      ? param.value.map(val => ({ key: param.key, value: val }))
      : [{ key: param.key, value: param.value }]
  );

  return (
    <TableView
      headers={[
        {
          title: "Key",
          renderer: new KeyValueRenderer("key"),
        },
        {
          title: "Value",
          renderer: new KeyValueRenderer("value"),
        },
      ]}
      data={flattenedParams}
    />
  );
};