import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { RegistryPaginationContext, RegistryPaginationSettingsContext, usePagination } from './pagination';
import { useSource } from '@/hooks/useSource';

export interface Service<T> {
  getItem: (props: { id: string | number }) => Promise<T>;
  getList: (props: {
    pagination: { top: number; skip: number };
    order: GridSortModel;
    filter?: string;
  }) => Promise<{ count: number; data: T[] }>;
  postItem: (props: { item: T }) => Promise<T>;
  patchItem: (props: { id: string | number; item: T }) => Promise<T>;
  putItem: (props: { id: string | number; item: T }) => Promise<T>;
  removeItem: (props: { id: string | number }) => Promise<void>;
}

export type GridRowId = string | number;

export type GridRowSelectionModel = GridRowId[];

export type GridSortDirection = 'asc' | 'desc' | null | undefined;

export interface GridSortItem {
  /**
   * The column field identifier.
   */
  field: string;
  /**
   * The direction of the column that the grid should sort.
   */
  sort: GridSortDirection;
}
/**
 * The model used for sorting the grid.
 */
export type GridSortModel = GridSortItem[];

export interface RegistryProps<T> {
  id?: string;
  action?: string;
  onOpenItem: (id: string) => void;
  service: Service<T>;

  filterConfig?: Record<
    string,
    {
      operator?: 'eq' | 'gt' | 'lt';
      label?: string;
      type?: 'date' | 'time' | 'date-time';
      filterName?: string;
    }
  >;
}

export const RegistryPropsContext = createContext<{ id?: string }>({});

export interface RegistryDataContextBody<T> {
  data?: T[];
  item?: T;
  pages?: number;

  save: (item: T) => Promise<T>;
  remove: () => Promise<any>;
}

export interface FilterBody {
  name: string;
  data: any;
}
export interface FilterValue {
  name: string;
  value: string | null;
}

export interface RegistryFiltersContextBody {
  filters: FilterBody[];
  values: FilterValue[];
  onChange: Dispatch<SetStateAction<FilterValue[]>>;
}

export interface RegistrySelectionBody {
  selectionModel: GridRowSelectionModel;
  onRowSelectionModelChange: Dispatch<SetStateAction<GridRowSelectionModel>>;
}

export interface RegistrySortContextBody {
  sortModel: GridSortModel;
  onSortModelChange: Dispatch<SetStateAction<GridSortModel>>;
}

export interface RegistryCurrentContextBody<T> {
  current: T;
  setCurrent: Dispatch<SetStateAction<T>>;
}

export const RegistryDataContext = createContext<RegistryDataContextBody<any>>({
  save: () => Promise.resolve(void 0),
  remove: () => Promise.resolve(void 0),
});

export const RegistryFiltersContext = createContext<RegistryFiltersContextBody>({
  filters: [],
  values: [],
  onChange: () => void 0,
});

export const RegistrySelectionContext = createContext<RegistrySelectionBody>({
  selectionModel: [],
  onRowSelectionModelChange: () => void 0,
});

export const RegistrySortContext = createContext<RegistrySortContextBody>({
  sortModel: [],
  onSortModelChange: () => void 0,
});

export const CurrentContext = createContext<RegistryCurrentContextBody<any>>({
  current: void 0,
  setCurrent: () => void 0,
});

export const RegistryProvider = <T,>({
  children,
  id,
  action,
  service: { getItem, getList, removeItem, postItem, patchItem },
  service,
  filterConfig = {},
  onOpenItem,
}: PropsWithChildren<RegistryProps<T>>) => {
  const variants = useMemo(() => [10, 50, 100], []);
  const paginationSettingsContext = useMemo(() => ({ count: variants[0], variants }), [variants]);
  const paginationContext = usePagination(paginationSettingsContext);

  const filterBodies = useMemo(
    () => Object.keys(filterConfig).map((name) => ({ name, data: (filterConfig as any)[name] })),
    [filterConfig],
  );

  const [filterValues, setFilterValues] = useState<FilterValue[]>([]);

  const registryFiltersContext = useMemo(
    () => ({ filters: filterBodies, values: filterValues, onChange: setFilterValues }),
    [filterBodies, filterValues],
  );

  const [sortModel, onSortModelChange] = useState<GridSortModel>([]);
  const registrySortContext = useMemo(() => ({ sortModel, onSortModelChange }), [sortModel, onSortModelChange]);

  const [selectionModel, onRowSelectionModelChange] = useState<GridRowSelectionModel>([]);
  const registrySelectionContext = useMemo(
    () => ({ selectionModel, onRowSelectionModelChange }),
    [selectionModel, onRowSelectionModelChange],
  );

  const [filter, setFilter] = useState('');

  useEffect(() => {
    const interv = setInterval(() => {
      setFilter(
        filterValues
          .filter((i) => !!i.value || (i.value as any) === 0 || (i.value as any) === false) // TODO: check types
          .map((i) => {
            const operator = (filterConfig as any)[i.name].operator;

            return operator === 'contains'
              ? `contains(${i.name}, '${i.value}')`
              : `${(filterConfig as any)[i.name]?.filterName ?? i.name} ${operator} '${i.value}'`;
          })
          .join(' and '),
      );
    }, 500);

    return () => {
      clearInterval(interv);
    };
  }, [filterValues, filterConfig]);

  const { data: itemsData, fetch: fetchList } = useSource(
    () =>
      getList({
        pagination: { skip: (paginationContext.page - 1) * paginationContext.limit, top: paginationContext.limit },
        order: sortModel,
        filter: filter ?? '',
      }),
    [paginationContext, filter, sortModel, getList],
  );

  const { data: item } = useSource(
    () => (!id ? Promise.resolve(action === 'create' ? ({} as T) : null) : getItem({ id })),
    [id, action, getItem],
  );

  const [current, setCurrent] = useState<T>();

  useEffect(() => {
    setCurrent(item as T);
  }, [item]);

  const remove = useCallback(() => {
    return Promise.all(selectionModel.map((i) => removeItem({ id: i }))).then(fetchList);
  }, [selectionModel, fetchList]);

  const save = useCallback(
    (item: T) => {
      const promise = !id ? postItem({ item }) : patchItem({ id, item });

      return promise
        .then((item) => {
          // @ts-ignore // TODO: check types
          onOpenItem(item.id);
          return item;
        })
        .catch((e) => {
          console.error(e);
          void 0;
        });
    },
    [id, onOpenItem],
  );

  const dataContext = useMemo(
    () => ({
      item,
      save,
      remove,
      data: itemsData?.data,
      pages: itemsData?.count && Math.ceil(itemsData.count / paginationContext.limit),
    }),
    [itemsData, item, save, remove],
  );

  useEffect(() => {
    paginationContext.setPage(1);
    onRowSelectionModelChange([]);
    setFilter('');
  }, [service]);

  const propsContext = useMemo(() => ({ id }), [id]);

  const currentContext = useMemo(() => ({ current, setCurrent }), [current, setCurrent]);

  return (
    <RegistryPaginationSettingsContext.Provider value={paginationSettingsContext}>
      <RegistryPropsContext.Provider value={propsContext}>
        <RegistryDataContext.Provider value={dataContext}>
          <CurrentContext.Provider value={currentContext}>
            <RegistryFiltersContext.Provider value={registryFiltersContext}>
              <RegistryPaginationContext.Provider value={paginationContext}>
                <RegistrySortContext.Provider value={registrySortContext}>
                  <RegistrySelectionContext.Provider value={registrySelectionContext}>
                    {children}
                  </RegistrySelectionContext.Provider>
                </RegistrySortContext.Provider>
              </RegistryPaginationContext.Provider>
            </RegistryFiltersContext.Provider>
          </CurrentContext.Provider>
        </RegistryDataContext.Provider>
      </RegistryPropsContext.Provider>
    </RegistryPaginationSettingsContext.Provider>
  );
};
