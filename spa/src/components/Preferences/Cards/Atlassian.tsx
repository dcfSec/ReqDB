import { Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { showSpinner } from '../../../stateSlices/MainLogoSpinnerSlice';
import APIClient, { APIErrorToastCallback, errorToastCallback, handleError, handleResult } from '../../../APIClients';
import { APISuccessData } from '../../../types/Generics';
import { toast } from '../../../stateSlices/NotificationToastSlice';
import { toggleUserConfiguration } from '../../../stateSlices/UserSlice';
import { RedirectLocation } from '../../../types/API/RedirectLocation';


/**
 * Component for notification preferences
 * 
 * @returns The notification preferences card
 */
export function Atlassian() {
  const dispatch = useAppDispatch()
  const { t } = useTranslation();
  const preferences = useAppSelector(state => state.user.preferences)

  function removeConnection() {
    dispatch(showSpinner(true))
    APIClient.delete(`/export/jira/connect`).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function okCallback(response: APISuccessData) {
      dispatch(toggleUserConfiguration({ id: "atlassianCloudActive", checked: false }))
      dispatch(toast({ header: t('preferences.atlassian.delete.toastHeader'), body: t('preferences.atlassian.delete.toastBody') }))
    }
  }

  function connect() {
    dispatch(showSpinner(true))
    APIClient.get(`/export/jira/login?browser=1`).then((response) => {
      handleResult(response, okCallback, APIErrorToastCallback)
    }).catch((error) => {
      handleError(error, APIErrorToastCallback, errorToastCallback)
    });
    async function okCallback(response: APISuccessData) {

      const popup = window.open((response.data as RedirectLocation).location, "popup", "popup=true,width=700,height=1024");
      if (!popup) {
        dispatch(toast({ header: t('preferences.atlassian.authWindow.toastHeader'), body: t('preferences.atlassian.authWindow.toastBody') }));
        return;
      }
      while (!popup.closed) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      if (!popup || popup.closed) {
        dispatch(toast({ header: t('preferences.atlassian.create.toastHeader'), body: t('preferences.atlassian.create.toastBody') }))
        dispatch(toggleUserConfiguration({ id: "atlassianCloudActive", checked: true })); //Add endpoint to check if token got saved
        return;
      }

    }
  }

  return <Card style={{ marginBottom: "1em" }}>
    <Card.Header as="h4">{t('preferences.atlassian.title')}</Card.Header>
    <Card.Body>
      {preferences.atlassianCloudActive ? <Button onClick={() => removeConnection()}>{t('preferences.atlassian.removeConnection')}</Button> : <Button onClick={() => connect()}>{t('preferences.atlassian.connect')}</Button>}
    </Card.Body>
  </Card>

}
