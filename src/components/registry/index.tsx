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
    filterValues?: any;
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

  sort?: GridSortModel;

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
  count?: number;
  item?: T;
  pages?: number;

  save: (item: T) => Promise<T>;
  remove: (id?: string | number) => Promise<any>;
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

export const RegistryCurrentContext = createContext<RegistryCurrentContextBody<any>>({
  current: void 0,
  setCurrent: () => void 0,
});

export const RegistryControlContext = createContext<{ reload: () => void; fetchList: () => void }>({
  reload: () => void 0,
  fetchList: () => void 0,
});

export const RegistryEditingContext = createContext<[editing: boolean, setEditing: Dispatch<SetStateAction<boolean>>]>([
  false,
  () => void 0,
]);

export const RegistryProvider = <T,>({
  children,
  id,
  action,
  service: { getItem, getList, removeItem, postItem, patchItem },
  service,
  sort,
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

  const [sortModel, onSortModelChange] = useState<GridSortModel>(sort ?? []);
  const registrySortContext = useMemo(() => ({ sortModel, onSortModelChange }), [sortModel, onSortModelChange]);

  useEffect(() => {
    onSortModelChange(sortModel);
  }, [sortModel]);

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
            const operator = (filterConfig as any)?.[i.name]?.operator;

            if (!operator) {
              return '';
            }

            return operator === 'contains'
              ? `contains(${i.name}, '${i.value}')`
              : operator === 'between'
              ? [
                  i.value?.[0] && `${(filterConfig as any)[i.name]?.filterName ?? i.name} gt '${i.value[0]}'`,
                  i.value?.[1] && `${(filterConfig as any)[i.name]?.filterName ?? i.name} lt '${i.value[1]}'`,
                ]
                  .filter(Boolean)
                  .join(' and ')
              : `${(filterConfig as any)[i.name]?.filterName ?? i.name} ${operator} '${i.value}'`;
          })
          .filter(Boolean)
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
        filterValues,
      }),
    [paginationContext.page, paginationContext.limit, filter, sortModel, getList],
  );

  const { data: item, fetch: reload } = useSource(
    () => (!id ? Promise.resolve(action === 'create' ? ({} as T) : null) : getItem({ id })),
    [id, action, getItem],
  );

  const [current, setCurrent] = useState<T>();

  useEffect(() => {
    setCurrent(item as T);
  }, [item]);

  const remove = useCallback(
    (id?: number | string) => {
      return Promise.all((id ? [id] : selectionModel).map((i) => removeItem({ id: i }))).then(fetchList);
    },
    [selectionModel, fetchList],
  );

  const save = useCallback(
    (item: T) => {
      const promise = !id ? postItem({ item }) : patchItem({ id, item });

      return promise.then((item) => {
        // @ts-ignore // TODO: check types
        onOpenItem(item.id);
        return item;
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
      count: itemsData?.count,
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
  const controlContext = useMemo(() => ({ reload, fetchList }), [reload, fetchList]);
  const editingContext = useState(false);

  useEffect(() => {
    editingContext[1](action === 'create');
  }, [action]);

  return (
    <RegistryControlContext.Provider value={controlContext}>
      <RegistryPaginationSettingsContext.Provider value={paginationSettingsContext}>
        <RegistryPropsContext.Provider value={propsContext}>
          <RegistryDataContext.Provider value={dataContext}>
            <RegistryCurrentContext.Provider value={currentContext}>
              <RegistryEditingContext.Provider value={editingContext}>
                <RegistryFiltersContext.Provider value={registryFiltersContext}>
                  <RegistryPaginationContext.Provider value={paginationContext}>
                    <RegistrySortContext.Provider value={registrySortContext}>
                      <RegistrySelectionContext.Provider value={registrySelectionContext}>
                        {children}
                      </RegistrySelectionContext.Provider>
                    </RegistrySortContext.Provider>
                  </RegistryPaginationContext.Provider>
                </RegistryFiltersContext.Provider>
              </RegistryEditingContext.Provider>
            </RegistryCurrentContext.Provider>
          </RegistryDataContext.Provider>
        </RegistryPropsContext.Provider>
      </RegistryPaginationSettingsContext.Provider>
    </RegistryControlContext.Provider>
  );
};
