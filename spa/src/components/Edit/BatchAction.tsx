import { ButtonGroup, DropdownButton } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { ReactNode, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { showSpinner } from '../../stateSlices/MainLogoSpinnerSlice';
import { APISuccessData } from '../../types/Generics';
import { toast } from '../../stateSlices/NotificationToastSlice';
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from '../../APIClients';
import { addIndexToRemoveList, removeItems } from '../../stateSlices/EditSlice';

type Props = {
  children?: ReactNode;
  needCascade: boolean;
  endpoint: string;
  humanKey: string;
}
/**
 * Component for the batch actions dropdown
 * 
 * @returns Returns a dropdown for batch action selection
 */
export function BatchActionDropdown({ children = null, needCascade, endpoint, humanKey }: Props) {
  const dispatch = useAppDispatch()

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [force, setForce] = useState(false);
  const [cascade, setCascade] = useState(false);

  const items = useAppSelector(state => state.edit.items)


  async function deleteBatch() {
    const parameters: string[] = []
    if (force) {
      parameters.push("force=true")
      if (cascade) {
        parameters.push("cascade=true")
      }
    }

    dispatch(showSpinner(true))

    const deletePromises = items.map((item, index) => {
      if (item.selected) {
        return APIClient.delete(`${endpoint}/${item.id}?${parameters.join("&")}`).then((response) => {
          handleResult(response, okCallback, APIErrorToastCallback)
          dispatch(addIndexToRemoveList(index))
          dispatch(toast({ header: "Item successfully deleted", body: `Item "${item[humanKey]}" deleted.` }))
        }).catch((error) => {
          handleError(error, APIErrorToastCallback, errorToastCallback)
        });
      }
      return Promise.resolve();
    });

    await Promise.all(deletePromises);

    dispatch(removeItems())
    dispatch(showSpinner(false))

    setShowDeleteModal(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function okCallback(response: APISuccessData) {
    }
  }


  return (<>
    <DropdownButton title="Batch Action" variant="success" id="batch-action-dropdown" as={ButtonGroup} >
      <Dropdown.Item onClick={() => setShowDeleteModal(true)}>Delete</Dropdown.Item>
      {children}
    </DropdownButton>
    <DeleteConfirmationModal show={showDeleteModal} item="all selected items" onCancel={() => setShowDeleteModal(false)} onConfirm={() => deleteBatch()} onForceChange={e => setForce(e)} force={force} needCascade={needCascade} onCascadeChange={e => setCascade(e)} />
  </>
  );
}