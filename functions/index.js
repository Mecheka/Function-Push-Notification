const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.firestore.document("User/{user_id}/Notification/{notification_id}").onWrite(event => {

    const user_id = event.params.user_id;
    const notification_id = event.params.notification_id;

    //console.log("User ID : " + user_id + " Notification ID : " + notification_id);

    return admin.firestore().collection("User").doc(user_id).collection("Notification").doc(notification_id).get().then(queryResult => {

        const from_user_id = queryResult.data().from;
        const from_message = queryResult.data().message;

        const from_data = admin.firestore().collection("User").doc(from_user_id).get();
        const to_data = admin.firestore().collection("User").doc(user_id).get();

        return Promise.all([from_data, to_data]).then(result => {

            const from_name = result[0].data().name;
            const to_name = result[1].data().name;
            const token_id = result[1].data().token_id;

            const payload = {
                notification:{
                    title: "Notification from : " + from_name,
                    body: from_message,
                    icon: "default"                 
                }
            };

            return admin.messaging().sendToDevice(token_id, payload).then(resultMessage => {

                return console.log("Notification Send.")

            });
            //return console.log("From User : " + from_naem + " | To User : " + to_name);

        });

        //console.log("From User ID : " + from_user_id);

    });

});