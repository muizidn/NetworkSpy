import React from 'react';
import { useAtom } from 'jotai';
import { statusInfoDialogAtom } from '@src/utils/trafficAtoms';
import { getHttpStatusInfo } from '@src/utils/httpStatusCodes';
import { Dialog } from './Dialog';

export const StatusInfoDialog: React.FC = () => {
  const [dialogState, setDialogState] = useAtom(statusInfoDialogAtom);

  if (!dialogState || !dialogState.isOpen || !dialogState.code) return null;

  const info = getHttpStatusInfo(dialogState.code);
  if (!info) return null;

  return (
    <Dialog
      isOpen={dialogState.isOpen}
      onClose={() => setDialogState({ ...dialogState, isOpen: false })}
      title={`${info.code} ${info.message}`}
      message={info.description}
      type="info"
    />
  );
};
