import React, {useState} from "react";
import MenuDrawer from "./MenuDrawer";
import {Button, Card, Typography} from "@material-ui/core";
import {
    clearShoppingCart, getAllShoppingCartArticles, getAllShoppingCartEntries,
    getShoppingCartCount,
    getShoppingCartPrice, isShoppingCartEmpty, ShoppingCartList
} from "../services/ShoppingCartUtil";
import Grid from "@material-ui/core/Grid";
import {padding} from "../Utilities/Utilities";
import PaymentIcon from '@material-ui/icons/Payment';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import {ContextType} from "../Utilities/TsUtilities";
import {DialogBuilder} from "../Utilities/DialogBuilder";
import {Link} from "react-router-dom";

interface IProps {

}

interface IState {
}

class ShoppingCart extends React.Component<IProps, IState> {

    constructor(props: IProps, context: any) {
        super(props, context);
        window.scrollTo(0, 0);
    }


    render() {
        let isEmpty = isShoppingCartEmpty();
        return (
            <MenuDrawer>
                <div style={{
                    marginTop: 8,
                }}>
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography component="h1" variant="h2" align="center"
                                        color="textPrimary"
                                        gutterBottom>
                                Warenkorb
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                <Grid container wrap={"wrap-reverse"} spacing={4}
                                      style={{width: '95%', maxWidth: isEmpty ? "1000px" : "1500px"}}>
                                    <Grid item md={isEmpty ? 12 : 9} sm={12}>
                                        <Grid container style={{width: "100%"}}>
                                            <Grid item xs={12}>
                                                <Card style={{marginTop: +isEmpty * 50, ...padding(18)}}>
                                                    {isEmpty ?
                                                        <div style={{textAlign: "center"}}>
                                                            <Typography variant="h4" gutterBottom>
                                                                Der Einkaufswagen ist leer
                                                            </Typography>
                                                            <Typography variant="h5" gutterBottom>
                                                                Suchen Sie sich doch ein paar Alben
                                                                Ihrer Wahl aus unserem {<Link
                                                                to={"/albums"}>Sortiment</Link>} aus
                                                            </Typography>
                                                        </div>
                                                        :
                                                        <ShoppingCartList
                                                            update={() => this.forceUpdate()}
                                                            showChangeCount={true}/>
                                                    }
                                                </Card>
                                            </Grid>
                                            <Grid item>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    {!isEmpty &&
                                    <Grid item md={3}>
                                        <Card style={padding(18)}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Typography variant="body1">
                                                        Gesamtpreis der Bestellung
                                                    </Typography>
                                                    <Typography variant="h5">
                                                        {getShoppingCartPrice().toFixed(2)} €
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="body1">
                                                        Gesamtanzahl der Bestellung
                                                    </Typography>
                                                    <Typography variant="h5">
                                                        {getShoppingCartCount()} Stück
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs>
                                                    <Button variant="contained" color="primary"
                                                            endIcon={<PaymentIcon/>}
                                                            onClick={event => {
                                                            }}>
                                                        {"Zur Kasse"}
                                                    </Button>
                                                </Grid>
                                                <Grid item xs>
                                                    <ClearShoppingCartButton context={this}/>
                                                </Grid>
                                            </Grid>
                                        </Card>
                                    </Grid>
                                    }                                </Grid>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </MenuDrawer>
        )
    }
}

function ClearShoppingCartButton({context}: ContextType<ShoppingCart>) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <Button variant="contained" color="secondary" endIcon={<DeleteIcon/>}
                    onClick={event => setOpen(true)}>
                {"Leeren"}
            </Button>
            {new DialogBuilder(open, dialogBuilder => setOpen(false))
                .setTitle("Einkaufswagen Leeren")
                .setText("Möchten Sie wirklich den kompletten Einkaufswagen unwiederruflich leeren?")
                .addButton("Abbrechen")
                .addButton(
                    {
                        label: "Leeren",
                        icon: <DeleteIcon/>,
                        color: "secondary",
                        isActionButton: true,
                        onClick: dialogBuilder => {
                            clearShoppingCart();
                            context.forceUpdate();
                        }
                    })
                .build()}
        </div>
    )
}

export default ShoppingCart;