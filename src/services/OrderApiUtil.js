import axios from "axios";
import {getSessionUser} from "./StorageUtil";

const apiBaseUrlPlaceOrder = `http://${window.location.hostname}:8080/order`;

/**
 * Creates a new order
 * @param payload The metadata of the order
 * @param onSuccess Called if the call was successfull
 * @param onFail Called when the creation failed
 */
export const placeOrder = (payload, onSuccess, onFail) => {
    var user = getSessionUser();
    axios.post(apiBaseUrlPlaceOrder, payload, {
        auth: {
            username: user.email,
            password: user.password
        }
    })
        .then(function (response) {

            if (response.status === 200) {
                console.log("Bestellung ok");
                if (onSuccess)
                    onSuccess(response);
            } else {
                console.log(response);
                console.log("Bestellung failed")
                if (onFail)
                    onFail(response);
            }
        })
        .catch(function (error) {
            console.log("Bestellung failed")
            console.log(error);
            if (onFail)
                onFail(error);
        });
};
