import React, {
  FC,
  PropsWithChildren,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DataError, DialogProps, DialogType, ErrorType, FormBody, ServerError } from './types';
import { useQueue } from '@/hooks/useQueue';
import { useEscape } from '@/hooks/useEscape';
import { DialogContext } from './dialog.context';

interface Props {
  Render: FC<{ onClose: () => void; text: ReactNode; title: ReactNode; form: ReactNode; submitEnabled: boolean }>;
}

export const DialogProvider = ({ children, Render }: PropsWithChildren<Props>) => {
  const { current, push, next } = useQueue<DialogProps>();
  const [formData, setFormData] = useState<FormBody>();
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Omit<DataError, 'condition' | 'type'>[]>([]);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const completed = useCallback(() => {
    setFormData(undefined);
    next();
    setTriedSubmit(false);
  }, []);

  useEffect(() => {
    if (current?.type === DialogType.Form && current.initialData) {
      setFormData(current.initialData);
    }
  }, [current]);

  const handleClose = useCallback(() => {
    current?.onClose?.();
    completed();
  }, [current]);

  useEscape(handleClose);

  const actualFormData = useMemo(() => {
    return current?.type === DialogType.Form
      ? formData ?? (current?.initialValue ? { value: current.initialValue } : undefined) ?? {}
      : {};
  }, [current, formData]);

  // const showCancelButton = useMemo(() => {
  //   if (current?.followData) {
  //     return !(actualFormData?.value?.length === 0);
  //   }

  //   return (current?.type === DialogType.Confirm || current?.type === DialogType.Form) && !current.hideCancel;
  // }, [current, actualFormData]);

  const errors = useMemo(() => {
    if (current?.type === DialogType.Form) {
      return (
        current.errors?.filter(
          (i) =>
            i.type === ErrorType.Data && i.condition(actualFormData) && Object.keys(actualFormData).includes(i.name),
        ) as DataError[]
      )?.map(({ name, string }) => ({ name, string }));
    }

    return;
  }, [current, actualFormData]);

  const handleSubmit = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      setServerErrors([]);

      if (errors?.length) {
        setTriedSubmit(true);
        return;
      }

      if (current?.type === DialogType.Form && current.handler) {
        setTriedSubmit(true);
        setLoading(true);

        current
          .handler(actualFormData)
          .then(() => {
            current.onSubmit?.();
            completed();
          })
          .catch(({ response }) => {
            setServerErrors(
              (
                current.errors?.filter((i) => i.type === ErrorType.Server && i.condition(response)) as ServerError[]
              )?.map<Omit<DataError, 'condition' | 'type'>>((i) => ({
                name: i.name,
                string: i.string(response),
              })),
            );
          })
          .finally(() => {
            setLoading(false);
          });
      } else if (current?.type === DialogType.Confirm) {
        current.onSubmit?.();
        completed();
      } else {
        completed();
      }

      return false;
    },
    [current, actualFormData, errors],
  );

  const body = useMemo(
    () =>
      current ? (
        <form onSubmit={handleSubmit}>
          <Render
            onClose={handleClose}
            title={current?.title}
            text={current?.text}
            submitEnabled={
              !(
                loading ||
                (current?.type === DialogType.Form && current?.submitEnabled && !current.submitEnabled(actualFormData))
              )
            }
            form={
              <>
                {current?.type === DialogType.Form && (
                  <current.form
                    value={actualFormData}
                    onChange={setFormData}
                    errors={serverErrors.length ? serverErrors : triedSubmit ? errors : undefined}
                  />
                )}
              </>
            }
          />
        </form>
      ) : null,
    [current, handleClose, setFormData, actualFormData, serverErrors, errors, handleSubmit, handleClose],
  );

  return (
    <DialogContext.Provider value={{ push }}>
      <>
        {children}

        {current && body}
      </>
    </DialogContext.Provider>
  );
};
