import React from 'react'
import {Grid, Card, Button, Typography, IconButton} from "@material-ui/core";
import {
    padding,
    showToast,
    hexToRgbA, isMobile,
} from "../Utilities/Utilities";
import MenuDrawer from "./MenuDrawer";
import Box from "@material-ui/core/Box";
import {Visibility, VisibilityOff} from "@material-ui/icons";
import {RestrictedPage, ROLES} from "../Utilities/TsUtilities";

/**
 * The main Component of Dev.js
 */
class Dev extends React.Component {

    buttonColors = {
        "GET": "#61affe",
        "PUT": "#fca130",
        "POST": "#49cc90",
        "DELETE": "#f93e3e"
    };


    constructor(props, context) {
        super(props, context);
        window.scrollTo(0,0);
    }

    render() {
        return (
            <RestrictedPage roleLevel={ROLES.ADMIN}>
                <MenuDrawer>
                    <div style={{
                        marginTop: 8,
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <Grid container
                              style={{width: isMobile() ? '100%' : '85%', maxWidth: "800px"}}
                              spacing={5}>
                            {this.generateComponents()}
                        </Grid>
                    </div>
                </MenuDrawer>
            </RestrictedPage>
        )
    }

    /**
     * Generates the component list based on allComponents
     * @return {JSX.Element}
     */
    generateComponents() {
        return (
            this.allComponents.map(category => {
                return (
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item>
                                <Typography component="h1" variant="h10" align={"left"}>
                                    {category.title}
                                </Typography>
                            </Grid>
                            <Grid item alignContent={"center"} justify="center">
                                <Box display="flex"
                                     alignItems="flex-end"
                                     style={{height: "100%"}}>
                                    <Box>
                                        <Typography component="h1" variant="h6">
                                            {category.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} style={{marginTop: 5}}
                              direction="column">
                            {this.generateContent(category)}
                        </Grid>
                    </Grid>
                )
            })
        )
    }

    /**
     * Generates the content of a specific category
     * @param category The category to be rendered
     * @return {JSX.Element[]}
     */
    generateContent(category) {

        return (
            category.content.map(call => {
                console.log(hexToRgbA((this.buttonColors[call.type]), 0.2))
                var key = category.title + "/" + call.name;
                if (!this.callResultMap[key])
                    this.callResultMap[key] = {
                        result: "",
                        completeResponse: "",
                        showCompleteResponse: false
                    };
                const currentCallResponse = this.callResultMap[key]
                return (
                    <Grid item>
                        <div onClick={event => {
                            let clickedClassName = event.target.className.toString();
                            if (!window.getSelection().toString() && (clickedClassName.includes("MuiTypography") || clickedClassName.includes("MuiPaper") || clickedClassName.includes("MuiGrid"))) {
                                currentCallResponse.showCompleteResponse = (!currentCallResponse.showCompleteResponse);
                                this.forceUpdate()
                            }
                        }}>
                            <Card style={{
                                ...padding(18),
                                backgroundColor: hexToRgbA((this.buttonColors[call.type]), 0.2)
                            }}
                                  fullWidth>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Grid container
                                              style={{maxHeight: 52}}
                                              alignContent={"center"}
                                              alignItems={"center"}
                                              justify={"center"}
                                              spacing={2}>
                                            <Grid item>
                                                <Button style={{
                                                    backgroundColor: (this.buttonColors[call.type]),
                                                    fontWeight: "bold",
                                                    color: "#FFFFFF"
                                                }} onClick={(event) => {
                                                    this.callResultMap[key] = {
                                                        result: "Wird geladen...",
                                                        completeResponse: "",
                                                        showCompleteResponse: false
                                                    };
                                                    this.forceUpdate();
                                                    call.callback((result, completeResponse) => {
                                                        if (result !== undefined) {
                                                            this.callResultMap[key] = {
                                                                result: result,
                                                                completeResponse: completeResponse,
                                                                showCompleteResponse: false
                                                            };
                                                            showToast("Anfrage Erfolgreich", "success");
                                                        } else {
                                                            showToast("Ein Fehler ist aufgetreten" + (completeResponse ? ": " + completeResponse : ""), "error");
                                                            this.callResultMap[key] = {
                                                                result: result,
                                                                completeResponse: completeResponse,
                                                                showCompleteResponse: false
                                                            };
                                                        }
                                                        this.forceUpdate();
                                                    });
                                                }}>
                                                    {call.type}
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Typography component="h1" variant="h6"
                                                            allign="left">
                                                    {call.name}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs>
                                                <Typography
                                                    style={currentCallResponse.result === undefined ? {color: "red"} : {}}
                                                    component="h1" variant="h6" align={"right"}>
                                                    {currentCallResponse.result !== undefined ? currentCallResponse.result : "Error"}
                                                </Typography>
                                            </Grid>
                                            {this.showCompleteResultButton(currentCallResponse)}
                                        </Grid>
                                    </Grid>
                                    {this.showCompleteResult(currentCallResponse)}
                                </Grid>
                            </Card>
                        </div>
                    </Grid>
                )
            })
        )
    }

    /**
     * Returns the button for showing the complete result
     * @param object The reference object
     * @return {JSX.Element}
     */
    showCompleteResultButton(object) {
        if (object.completeResponse) {
            return (
                <Grid item>
                    <IconButton
                        onClick={event => {
                            object.showCompleteResponse = (!object.showCompleteResponse);
                            this.forceUpdate()
                        }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                        }}>
                        {object.showCompleteResponse ?
                            <VisibilityOff/> :
                            <Visibility/>}
                    </IconButton>
                </Grid>

            )
        }
    }

    /**
     * Returns the complete result for an object
     * @param object The reference object
     * @return {JSX.Element}
     */
    showCompleteResult(object) {
        if (object.showCompleteResponse && object.completeResponse) {
            return (
                <Grid item xs={12}>
                    <Typography align={"left"} style={{whiteSpace: 'pre-wrap', marginTop: 5}}>
                        {object.completeResponse}
                    </Typography>
                </Grid>
            )
        }
    }

    /**
     * Retrieves the response for a component
     * @param resultCallback Called when a result is received
     * @param endpoint The endpoint for the call
     * @param label The name for the result text
     */
    apiGetData(resultCallback, endpoint, label) {
        fetch(new Request(`http://${window.location.hostname}:8080/` + endpoint, {method: 'GET'}))
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error('Fehler bei der Anfrage: ' + response.status + " " + response.statusText);
                }
            })
            .then(response => {
                resultCallback("Es sind " + response.length + " " + label + " initialisiert", JSON.stringify(response, null, 2));
            })
            .catch(reason => {
                resultCallback(undefined, reason.message);
            })
    }

    callResultMap = {};

    allComponents = [
        {
            title: "article",
            description: "test Api - provides basic test Functions and example Data",
            content: [
                {
                    type: "GET",
                    name: "/article",
                    description: "gets All Article Metadata Objects",
                    callback: func => this.apiGetData(func, "/article/", "Artikel")
                },
            ]
        },
        {
            title: "Beispiele",
            description: "Beispiel Api Calls",
            content: [
                {
                    type: "DELETE",
                    name: "/errorExampleWithMessage",
                    description: "provides basic test Functions and example Data",
                    callback: func => func(undefined, "Es ist ein Fehler aufgetreten: 1234 AAAAAHH!")
                },
                {
                    type: "POST",
                    name: "/errorExample",
                    description: "provides basic test Functions and example Data",
                    callback: func => func(undefined, undefined)
                }
            ]
        }
    ]

}

export default Dev;
