import {Selector} from 'testcafe';

const config = require('../config/config');

fixture`Device deletion`
    .page`${config.baseUrl}/`;

test('Delete the last device and verify it is removed from the list', async t => {
    const response = await t.request({
        url: config.apiUrl,
        method: 'GET'
    });
    const lastDevice = response.body[response.body.length - 1];

    // Get the  device elements
    const deviceElements = Selector('.device-info');

    // Get the initial count of devices before deletion
    const initialDeviceCount = await deviceElements.count;

    // Delete the last device via API
    await t.request({
        url: `${config.apiUrl}/${lastDevice.id}`,
        method: 'DELETE'
    });

    // Reload the page and verify the device is removed
    await t.eval(() => location.reload(true));

    await t.wait(2000); // waiting for the UI to reflect the change

    const updatedDeviceElements = Selector('.device-info');

    // Assert that the deleted device is not in the list and that the list count has decreased
    const deletedDeviceElement = updatedDeviceElements.withText(lastDevice.system_name);
    await t
        .expect(deletedDeviceElement.exists).notOk(`Device "${lastDevice.system_name}" should not be present in the list after deletion`)
        .expect(updatedDeviceElements.count).eql(initialDeviceCount - 1, 'Device count should decrease by one after deletion');
});