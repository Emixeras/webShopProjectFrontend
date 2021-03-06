import React, {Component} from 'react';
import {isMobile, NavigationComponent} from "../Utilities/Utilities";
import Grid from "@material-ui/core/Grid";
import Lottie from 'react-lottie';
import lottiedata from "../assets/order.json";
import {
    Card,
    Button,
} from '@material-ui/core';
import MenuDrawer from "./MenuDrawer";
import 'react-toastify/dist/ReactToastify.css';
import {padding} from "../Utilities/Utilities";
import {
    getSessionUser, isUserLoggedIn
} from "../services/StorageUtil";
import Typography from "@material-ui/core/Typography";

/**
 * The main Component of OrderComplete.js
 */
class OrderComplete extends Component {

    user = {};

    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            user: getSessionUser(),
            paymentMethod: -1,
        };

    }

    componentDidMount() {
        this.id = setTimeout(() => this.setState({redirect: true}), 5000)
    }

    componentWillUnmount() {
        clearTimeout(this.id)
    }

    render() {
        if (isUserLoggedIn()) {
            const defaultOptions = {
                loop: false,
                autoplay: true,
                animationData: lottiedata,
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid slice'
                }
            };

            return this.state.redirect
                ? <NavigationComponent to={"/"}/>
                : <MenuDrawer>
                    <div style={{
                        marginTop: 8,
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <Grid container
                              style={{width: isMobile() ? '100%' : '85%', maxWidth: "800px"}}
                              spacing={3}>
                            <Grid item xs={12}>
                                <Card style={padding(18)}>
                                    <Grid
                                        container
                                        direction="column">
                                        <Grid item fullWidth>
                                            <div style={{
                                                textAlign: "start",
                                                fontSize: 22,
                                                marginBottom: 3
                                            }}>
                                                Vielen Dank für ihre Bestellung! Sie werden in
                                                wenigen Sekunden weitergeleitet.
                                                <Lottie options={defaultOptions}
                                                        height={250}
                                                        width={250}
                                                        isStopped={this.state.isStopped}
                                                        isPaused={this.state.isPaused}/>
                                            </div>
                                        </Grid>
                                        <Grid item>
                                            <Typography> </Typography>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Grid>
                            <Grid item>
                                <div style={{marginBottom: 8}}/>
                            </Grid>
                        </Grid>
                    </div>
                </MenuDrawer>

        } else {
            return <NavigationComponent to={"/login"}/>;
        }
    }

    handleChange = event => this.setState({title: event.target.value.trim()});
}

export default OrderComplete;