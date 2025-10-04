import { Table as AntdTable, Typography } from "antd";

const { Text } = Typography;
import type { ColumnsType, TableProps as AntdTableProps } from "antd/es/table";
import type { CSSProperties, HTMLAttributes, MouseEventHandler, ReactElement, ReactNode, TdHTMLAttributes } from "react";
import { Children, isValidElement, useMemo } from "react";
import { cn } from "./utils";

type SectionType = "header" | "body" | "footer";

interface BaseSectionProps {
  children?: ReactNode;
  className?: string;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: ReactNode;
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

interface TableCaptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

interface ParsedCell {
  key: React.Key | null;
  children: ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  style?: CSSProperties;
  align?: "left" | "right" | "center";
  onClick?: MouseEventHandler<HTMLTableCellElement>;
  rest: Partial<TdHTMLAttributes<HTMLTableCellElement>>;
}

interface ParsedRow {
  key: React.Key;
  className?: string;
  cells: ParsedCell[];
  rest: Partial<HTMLAttributes<HTMLTableRowElement>>;
}

interface ParsedTable {
  headerRows: ParsedRow[];
  bodyRows: ParsedRow[];
  footerRows: ParsedRow[];
  caption?: ReactNode;
}

const TableHeaderSymbol = Symbol("TableHeader");
const TableBodySymbol = Symbol("TableBody");
const TableFooterSymbol = Symbol("TableFooter");
const TableRowSymbol = Symbol("TableRow");
const TableHeadSymbol = Symbol("TableHead");
const TableCellSymbol = Symbol("TableCell");
const TableCaptionSymbol = Symbol("TableCaption");

function markComponent<T extends React.ComponentType<any>>(component: T, symbol: symbol) {
  (component as unknown as { __uiTableType: symbol }).__uiTableType = symbol;
  return component;
}

function getComponentSymbol(element: ReactElement): symbol | null {
  if (!isValidElement(element)) {
    return null;
  }
  return (element.type as { __uiTableType?: symbol }).__uiTableType ?? null;
}

function parseSection(section: ReactElement | null, sectionType: SectionType): ParsedRow[] {
  if (!section) {
    return [];
  }

  const rows: ParsedRow[] = [];

  Children.forEach(section.props.children, child => {
    if (!isValidElement(child) || getComponentSymbol(child) !== TableRowSymbol) {
      return;
    }

    const { children, className, ...restRow } = child.props as TableRowProps;
    const rowKey = child.key ?? rows.length;
    const row: ParsedRow = {
      key: rowKey,
      className,
      cells: [],
      rest: restRow,
    };

    Children.forEach(children, cellChild => {
      if (!isValidElement(cellChild)) {
        return;
      }

      const cellSymbol = getComponentSymbol(cellChild);
      const isHeaderCell = sectionType === "header" && cellSymbol === TableHeadSymbol;
      const isBodyCell = sectionType !== "header" && cellSymbol === TableCellSymbol;

      if (!isHeaderCell && !isBodyCell) {
        return;
      }

      const { children: cellChildren, className: cellClassName, colSpan, rowSpan, style, align, onClick, ...restCell } =
        cellChild.props as TableHeadProps & TableCellProps;

      row.cells.push({
        key: cellChild.key ?? row.cells.length,
        children: cellChildren,
        className: cellClassName,
        colSpan,
        rowSpan,
        style,
        align,
        onClick,
        rest: restCell,
      });
    });

    rows.push(row);
  });

  return rows;
}

function buildParsedTable(children: ReactNode): ParsedTable {
  let headerSection: ReactElement | null = null;
  let bodySection: ReactElement | null = null;
  let footerSection: ReactElement | null = null;
  let caption: ReactNode | undefined;

  Children.forEach(children, child => {
    if (!isValidElement(child)) {
      return;
    }

    const symbol = getComponentSymbol(child);

    if (symbol === TableHeaderSymbol) {
      headerSection = child;
    } else if (symbol === TableBodySymbol) {
      bodySection = child;
    } else if (symbol === TableFooterSymbol) {
      footerSection = child;
    } else if (symbol === TableCaptionSymbol) {
      caption = child.props.children;
    }
  });

  return {
    headerRows: parseSection(headerSection, "header"),
    bodyRows: parseSection(bodySection, "body"),
    footerRows: parseSection(footerSection, "footer"),
    caption,
  };
}

type InternalRow = {
  __key: React.Key;
  __className?: string;
  __cells: ParsedCell[];
  __rest: Partial<HTMLAttributes<HTMLTableRowElement>>;
};

type InternalTableProps = Omit<AntdTableProps<InternalRow>, "columns" | "dataSource" | "rowKey" | "rowClassName"> & {
  className?: string;
  children?: ReactNode;
  rowKey?: AntdTableProps<InternalRow>["rowKey"];
};

export function Table({ className, children, rowKey, pagination = false, ...rest }: InternalTableProps) {
  const parsed = useMemo(() => buildParsedTable(children), [children]);


  const summary = parsed.footerRows.length > 0 ? () => (
    <AntdTable.Summary>
      {parsed.footerRows.map((row, rowIndex) => (
        <AntdTable.Summary.Row key={row.key ?? rowIndex} className={cn(row.className)} {...row.rest}>
          {row.cells.map((cell, cellIndex) => (
            <AntdTable.Summary.Cell
              key={cell.key ?? cellIndex}
              colSpan={cell.colSpan}
              rowSpan={cell.rowSpan}
              className={cn(cell.className)}
              align={cell.align}
              {...cell.rest}
            >
              {cell.children}
            </AntdTable.Summary.Cell>
          ))}
        </AntdTable.Summary.Row>
      ))}
    </AntdTable.Summary>
  ) : undefined;

  const columns: ColumnsType<InternalRow> = useMemo(() => {
    const longestRowLength = Math.max(
      0,
      ...parsed.headerRows.map(row => row.cells.length),
      ...parsed.bodyRows.map(row => row.cells.length),
    );

    return Array.from({ length: longestRowLength }).map((_, columnIndex) => {
      const headerCell = parsed.headerRows[0]?.cells[columnIndex];

      return {
        key: `col-${columnIndex}`,
        dataIndex: `col-${columnIndex}`,
        title: headerCell?.children ?? null,
        onHeaderCell: () => ({
          className: cn(headerCell?.className),
          colSpan: headerCell?.colSpan,
          rowSpan: headerCell?.rowSpan,
          style: headerCell?.style,
        }),
        align: headerCell?.align,
        render: (_: unknown, record: InternalRow) => {
          const cell = record.__cells[columnIndex];
          if (!cell) {
            return null;
          }

          if (cell.colSpan === 0 || cell.rowSpan === 0) {
            return {
              props: { colSpan: cell.colSpan, rowSpan: cell.rowSpan },
              children: null,
            };
          }

          return {
            props: {
              className: cn(cell.className),
              colSpan: cell.colSpan,
              rowSpan: cell.rowSpan,
              style: cell.style,
              onClick: cell.onClick,
              ...cell.rest,
            },
            children: cell.children,
          };
        },
      };
    });
  }, [parsed.headerRows, parsed.bodyRows]);

  const dataSource: InternalRow[] = useMemo(
    () =>
      parsed.bodyRows.map((row, index) => ({
        __key: row.key ?? index,
        __className: row.className,
        __cells: row.cells,
        __rest: row.rest,
      })),
    [parsed.bodyRows],
  );

  return (
    <div className={cn(className)}>
      <AntdTable
        {...rest}
        pagination={pagination}
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey ?? "__key"}
        rowClassName={record => cn(record.__className)}
        onRow={record => ({ ...(record.__rest ?? {}) })}
        summary={summary}
      />
      {parsed.caption ? (
        <Text type="secondary" className="mt-4 block text-sm">{parsed.caption}</Text>
      ) : null}
    </div>
  );
}

const TableHeader = markComponent(function TableHeader(props: BaseSectionProps) {
  return <>{props.children}</>;
}, TableHeaderSymbol);

const TableBody = markComponent(function TableBody(props: BaseSectionProps) {
  return <>{props.children}</>;
}, TableBodySymbol);

const TableFooter = markComponent(function TableFooter(props: BaseSectionProps) {
  return <>{props.children}</>;
}, TableFooterSymbol);

const TableRow = markComponent(function TableRow(props: TableRowProps) {
  return <>{props.children}</>;
}, TableRowSymbol);

const TableHead = markComponent(function TableHead(props: TableHeadProps) {
  return <>{props.children}</>;
}, TableHeadSymbol);

const TableCell = markComponent(function TableCell(props: TableCellProps) {
  return <>{props.children}</>;
}, TableCellSymbol);

const TableCaption = markComponent(function TableCaption(props: TableCaptionProps) {
  return <>{props.children}</>;
}, TableCaptionSymbol);

export { TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
