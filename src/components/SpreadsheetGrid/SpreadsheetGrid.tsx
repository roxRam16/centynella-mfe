import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import type { CellValue, JspreadsheetInstanceElement, WorksheetInstance } from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';

export interface SpreadsheetGridColumn {
  /** Encabezado visible. */
  title: string;
  width?: number;
  type?: 'text' | 'numeric' | 'dropdown';
  /** Opciones del desplegable (solo con `type: 'dropdown'`). */
  source?: string[];
}

export interface SpreadsheetGridHandle {
  /** Snapshot actual de la cuadrícula, fila por fila, en el mismo orden que `columns`. */
  getData: () => CellValue[][];
}

export interface SpreadsheetGridProps {
  columns: readonly SpreadsheetGridColumn[];
  /** Datos iniciales (fila por fila, en el orden de `columns`). Solo se usan al montar: para
   * cambiarlos de verdad hay que remontar el componente (pásale una `key` distinta). */
  data: CellValue[][];
  /** Filas mínimas que muestra la cuadrícula (vacías si `data` trae menos). */
  minRows?: number;
}

/**
 * Envoltorio de React sobre `jspreadsheet-ce` (MIT): una cuadrícula que se ve y se comporta como
 * Excel (letras de columna, selección de celdas, copiar/pegar, arrastrar para rellenar, insertar
 * y borrar filas). La librería maneja su propio DOM por dentro, así que esto es deliberadamente
 * imperativo — nada de sincronizar cada tecleo con el estado de React — expone `getData()` por
 * `ref` para leer la foto final de la cuadrícula cuando quien la usa decide guardar.
 */
export const SpreadsheetGrid = forwardRef<SpreadsheetGridHandle, SpreadsheetGridProps>(
  function SpreadsheetGrid({ columns, data, minRows = 20 }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<WorksheetInstance | null>(null);

    useEffect(() => {
      const element = containerRef.current;
      if (!element) return;

      const [instance] = jspreadsheet(element, {
        worksheets: [
          {
            data,
            columns: columns.map((column) => ({
              type: column.type ?? 'text',
              title: column.title,
              width: column.width ?? 140,
              source: column.source,
            })),
            minDimensions: [columns.length, minRows],
            allowInsertRow: true,
            allowManualInsertRow: true,
            allowDeleteRow: true,
            allowInsertColumn: false,
            allowDeleteColumn: false,
            allowRenameColumn: false,
            tableOverflow: true,
            tableHeight: '420px',
          },
        ],
      });
      instanceRef.current = instance;

      return () => {
        // `jspreadsheet()` convierte el div en un `JspreadsheetInstanceElement` por dentro (le
        // agrega `.spreadsheet`); los tipos no lo reflejan en la variable, pero en tiempo de
        // ejecución ya lo es.
        jspreadsheet.destroy(element as JspreadsheetInstanceElement);
        instanceRef.current = null;
      };
      // Solo al montar: `columns`/`data` son el estado INICIAL, no props reactivas (ver el
      // comentario de `data` arriba). Cambiarlas aquí reconstruiría la cuadrícula y borraría lo
      // que la persona ya haya escrito.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      getData: () => instanceRef.current?.getData() ?? [],
    }));

    return <div ref={containerRef} />;
  },
);
