import React from "react";
import {
    alignCenter,
    Article,
    base64ToDataUri,
    callIfExists,
    LazyImage,
    loadSingleImage
} from "../Utilities/TsUtilities";
import {Button, Grid, IconButton, Typography} from "@material-ui/core";
import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import DeleteIcon from '@material-ui/icons/Delete';
import {Link} from "react-router-dom";
import {showToast} from "../Utilities/Utilities";

const SHOPPING_CART: string = "SHOPPING_CART";
const emptyShoppingCart: ShoppingCartObject = {entries: []};

export interface ShoppingCartObject {
    entries: ShoppingCartEntry[]
}

export interface ShoppingCartEntry {
    article: Article;
    count: number;
}

//  ------------------------- Internal ------------------------->
/**
 * Ensures that a shoppingCart object is alway in the localStorage
 */
function apply() {
    let item = localStorage.getItem(SHOPPING_CART);
    if (!item)
        localStorage.setItem(SHOPPING_CART, JSON.stringify(emptyShoppingCart));
}

apply();

// ---------------

/**
 * Gets the shoppingCartObject from the localStorage
 * @return the ShoppingCartObject
 */
export function getShoppingCartObject(): ShoppingCartObject {
    let item = localStorage.getItem(SHOPPING_CART);
    if (item)
        return JSON.parse(item);
    else
        return emptyShoppingCart
}

/**
 * Saves the ShoppingCartObject to the localStorage
 * @param shoppingCartObject The object to be saved
 */
function saveShoppingCartObject(shoppingCartObject: ShoppingCartObject) {
    localStorage.setItem(SHOPPING_CART, JSON.stringify(shoppingCartObject))
}

/**
 * Gets the ShoppingCartEntry for a specific article
 * @param article
 * @param shoppingCartObject
 * @return {ShoppingCartObject | null} The shoppingCartEntry or null is article isn't in the shoppingCart
 */
function getShoppingCartEntry(article: Article, shoppingCartObject?: ShoppingCartObject): ShoppingCartEntry | null {
    if (!shoppingCartObject)
        shoppingCartObject = getShoppingCartObject();
    for (const entry of shoppingCartObject.entries) {
        if (entry.article.id === article.id)
            return entry;
    }
    return null;
}
//  <------------------------- Internal -------------------------


//  ------------------------- Add and Remove ------------------------->
export enum AAR_RETURN_TYPE {
    ADDED, REMOVED, INCREASED, DECREASED, NULL
}

/**
 * Adds the article to the shoppingCart, or increases its count
 * @param article The article to be added
 */
export function addToShoppingCart(article: Article): AAR_RETURN_TYPE {
    let shoppingCartObject = getShoppingCartObject();
    let shoppingCartEntry = getShoppingCartEntry(article, shoppingCartObject);
    let returnValue: AAR_RETURN_TYPE;
    if (shoppingCartEntry) {
        shoppingCartEntry.count += 1;
        returnValue = AAR_RETURN_TYPE.INCREASED;
    } else {
        shoppingCartObject.entries.push({article: article, count: 1});
        returnValue = AAR_RETURN_TYPE.ADDED;
    }
    saveShoppingCartObject(shoppingCartObject);
    return returnValue;
}

/**
 * Removes the article from the shoppingCart
 * @param article The article to be removed
 */
export function removeFromShoppingCart(article: Article): AAR_RETURN_TYPE {
    let shoppingCartObject = getShoppingCartObject();
    let shoppingCartEntry = getShoppingCartEntry(article, shoppingCartObject);
    let returnValue: AAR_RETURN_TYPE;
    if (!shoppingCartEntry)
        return AAR_RETURN_TYPE.NULL;
    if (shoppingCartEntry.count > 1) {
        shoppingCartEntry.count -= 1;
        returnValue = AAR_RETURN_TYPE.DECREASED;
    } else {
        shoppingCartObject.entries = shoppingCartObject.entries.filter(entry => entry.article.id !== article.id);
        returnValue = AAR_RETURN_TYPE.REMOVED;
    }
    saveShoppingCartObject(shoppingCartObject);
    return returnValue;
}
//  <------------------------- Add and Remove -------------------------


//  ------------------------- Convenience ------------------------->
/**
 * Checks if the article is in the shoppingCart
 * @param article The article to be checked
 */
export function isInShoppingCart(article: Article): boolean {
    for (const entry of getShoppingCartObject().entries) {
        if (article.id === entry.article.id)
            return true;
    }
    return false;
}

/**
 * Clears the shoppingCart
 */
export function clearShoppingCart() {
    localStorage.setItem(SHOPPING_CART, JSON.stringify(emptyShoppingCart))
}
//  <------------------------- Convenience -------------------------


//  ------------------------- getters ------------------------->
/**
 * Gets the count of all the items, or for a specific article in the shoppingCart
 * @param article Optional if the count of a specific article is wanted
 */
export function getShoppingCartCount(article?: Article): number {
    if (article) {
        let entry = getShoppingCartEntry(article);
        if (entry)
            return entry.count;
        else
            return 0;
    } else {
        let allCount = 0;
        for (const entry of getShoppingCartObject().entries)
            allCount += entry.count;
        return allCount;
    }
}

/**
 * Gets the cumulative price of all the items, or for a specific article in the shoppingCart
 * @param article Optional if the cumulative price of a specific article is wanted
 */
export function getShoppingCartPrice(article?: Article): string {
    let result: number;
    if (article) {
        let entry = getShoppingCartEntry(article);
        if (entry)
            result = +entry.article.price * entry.count;
        else
            result = -1;
    } else {
        let allPrice = 0;
        for (const entry of getShoppingCartObject().entries)
            allPrice += +entry.article.price * entry.count;
        result = allPrice;
    }
    return result.toFixed(2);
}

/**
 * Checks if the shoppingCart is empty
 */
export function isShoppingCartEmpty(): boolean {
    return getShoppingCartObject().entries.length === 0;
}

// ---------------

/**
 * Returns all the shoppingCartEntries
 */
export function getAllShoppingCartEntries(): ShoppingCartEntry[] {
    return getShoppingCartObject().entries
}

/**
 * Returns all the articles in the shoppingCart
 */
export function getAllShoppingCartArticles(): Article[] {
    return getAllShoppingCartEntries().map(entry => entry.article)
}
//  <------------------------- getters -------------------------


//  ------------------------- List ------------------------->
interface ShoppingCartList_props {
    showChangeCount: boolean;
    update?: () => void;
    shoppingCart: any;
}

/**
 * A reusable component for displaying the shoppingCart entries in a list
 */
export class ShoppingCartList extends React.Component<ShoppingCartList_props, {}> {

    entryArray: ShoppingCartEntry[]
    update?: () => void;
    totalPriceWithoutShipping: number

    constructor(props: ShoppingCartList_props, context: any) {
        super(props, context);
        this.totalPriceWithoutShipping = 0;
        if (this.props.shoppingCart) {
            this.entryArray = this.props.shoppingCart
            // @ts-ignore
            this.props.shoppingCart.map((item) =>
                this.totalPriceWithoutShipping = this.totalPriceWithoutShipping + (parseFloat(item.count) * parseFloat(item.article.price))
            );
            console.log(this.totalPriceWithoutShipping)
        } else {
            this.entryArray = getAllShoppingCartEntries();
        }
        this.update = props.update;
    }

    componentWillUpdate(nextProps: Readonly<ShoppingCartList_props>, nextState: Readonly<{}>, nextContext: any) {
        if (this.props.shoppingCart) {
            this.entryArray = this.props.shoppingCart
        } else {
            this.entryArray = getAllShoppingCartEntries();
        }
    }

    render() {
        return (
            <Grid container spacing={1}>
                {
                    this.entryArray.map((entry, index) => {
                        return <ShoppingCartListItem update={() => callIfExists(this.update)}
                                                     entry={entry} index={index}
                                                     array={this.entryArray}
                                                     showChangeCount={this.props.showChangeCount}
                                                     isDetails={!!this.props.shoppingCart}/>
                    })
                }
            </Grid>
        )
    }
}

interface ShoppingCartListItem_props {
    isDetails: boolean;
    entry: ShoppingCartEntry;
    index: number;
    array: ShoppingCartEntry[];
    showChangeCount: boolean;
    update: () => void;
}

/**
 * A single entry in the the ShoppingCartList
 */
class ShoppingCartListItem extends React.Component<ShoppingCartListItem_props, {}> {
    isDetails: boolean
    entry: ShoppingCartEntry
    index: number
    showChangeCount: boolean
    article: Article;
    update: () => void;
    count: number;
    price: number;

    constructor(props: ShoppingCartListItem_props, context: any) {
        console.log(JSON.stringify(props))
        super(props, context);
        this.isDetails = props.isDetails;
        this.entry = props.entry;
        this.index = props.index;
        this.showChangeCount = props.showChangeCount;
        this.article = this.entry.article;
        this.update = props.update;
        this.count = this.isDetails ? props.entry.count : getShoppingCartCount(this.article);
        this.price = this.isDetails ? (parseFloat(props.entry.article.price) * props.entry.count) : parseFloat(getShoppingCartPrice(this.article));
    }

    componentWillUpdate(nextProps: Readonly<ShoppingCartListItem_props>, nextState: Readonly<{}>, nextContext: any) {
        this.isDetails = nextProps.isDetails;
        this.entry = nextProps.entry;
        this.index = nextProps.index;
        this.showChangeCount = nextProps.showChangeCount;
        this.article = this.entry.article;
        this.update = nextProps.update;
        this.count = this.isDetails ? nextProps.entry.count : getShoppingCartCount(this.article);
        this.price = this.isDetails ? (parseFloat(nextProps.entry.article.price) * nextProps.entry.count) : parseFloat(getShoppingCartPrice(this.article));
    }

    render() {
        let sCc = this.showChangeCount;
        return (
            <Grid item xs={12} className={"mobile"}
                  style={{
                      borderRadius: "4px",
                      padding: 8, ...(this.index % 2 === 1 ? {backgroundColor: "rgba(0,0,0,0.05)"} : {backgroundColor: "rgba(0,0,0,0.0)"})
                  }}>
                <Grid container spacing={2}>
                    <Grid item className={"no-print"}>
                        <div style={alignCenter(true)}>
                            <LazyImage
                                getSrc={setImgSrc => {
                                    if (this.isDetails) {
                                        if (this.article.picture) { // @ts-ignore
                                            setImgSrc(base64ToDataUri(this.article.picture))
                                        }
                                    } else
                                        loadSingleImage("article", this.article.id, setImgSrc, 100)
                                }}
                                payload={this.article}
                                shouldImageUpdate={(oldPayload: Article, newPayload: Article) => {
                                    return oldPayload.id !== newPayload.id;
                                }}
                                rounded
                                className={"shoppingCartImage"}
                                style={{
                                    width: 75,
                                    height: 75,
                                    backgroundColor: "lightgray",
                                }}/>
                        </div>
                    </Grid>
                    <Grid item lg={sCc ? 3 : 4} xs={8}>
                        <Grid container style={{height: "100%"}}
                              direction={"column"}>
                            <Grid item>
                                <Typography variant="h6" style={{color: "rgba(0,0,0,0.87)"}}
                                            gutterBottom to={(location: any) => {
                                    location.pathname = "/articleView";
                                    location.state = {
                                        article: this.article,
                                        isDetails: this.isDetails
                                    };
                                    return location;
                                }} component={Link}>
                                    {this.article.title}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    {(+this.article.price).toFixed(2)} €
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item lg={sCc ? 2 : 3} md={sCc ? 4 : 5} xs={sCc ? 4 : 5}>
                        <Grid container style={{height: "100%"}}
                              direction={"column"}>
                            <Grid item>
                                <Typography variant="body1"
                                            style={{marginTop: 3, marginBottom: 6}}>
                                    {this.article.artists.name}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    {this.article.genre.name}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item lg={3} md={sCc ? 4 : 5} xs={sCc ? 4 : 5}>
                        <Grid container style={{height: "100%"}}
                              direction={"column"}>
                            <Grid item>
                                <Typography variant="body1"
                                            style={{marginTop: 3, marginBottom: 6}}>
                                    Stück: {this.count}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    Gesamt: {(this.price).toFixed(2)} €
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    {this.showChangeCount &&
                    <Grid item lg={2} md={3} xs={3}>
                        <ShoppingCartListItemButtons update={() => this.update()}
                                                     article={this.article}/>
                    </Grid>}
                </Grid>
                {this.props.array.length - 1 > this.index &&
                <hr className={"shoppingCartList-articleDivider"} style={{display: 'none'}}/>
                }
            </Grid>
        )
    }

}

interface ShoppingCartListItemButtons_props {
    article: Article;
    update: () => void;
}

/**
 * The buttons for increasing or decreasing the count of a article in the shoppingCart
 */
class ShoppingCartListItemButtons extends React.Component<ShoppingCartListItemButtons_props, {}> {
    article: Article;
    count: number;
    update: () => void;


    constructor(props: ShoppingCartListItemButtons_props, context: any) {
        super(props, context);
        this.article = props.article;
        this.update = props.update;
        this.count = getShoppingCartCount(this.article);
    }

    componentWillUpdate(nextProps: Readonly<ShoppingCartListItemButtons_props>, nextState: Readonly<{}>, nextContext: any) {
        this.article = nextProps.article;
        this.update = nextProps.update;
        this.count = getShoppingCartCount(this.article);
    }

    render() {
        return (
            <div style={{
                display: "flex",
                height: "100%",
                alignItems: "center"
            }}>
                <Grid container>
                    <Grid item>
                        <IconButton onClick={event => {
                            removeFromShoppingCart(this.article);
                            if (getShoppingCartCount(this.article) === 0)
                                showToast("Artikel wurde aus dem Einkaufswagen entfernt", "success");
                            this.update();
                        }} color={"secondary"}>{this.count > 1 ? <RemoveIcon/> :
                            <DeleteIcon/>}</IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton onClick={event => {
                            addToShoppingCart(this.article);
                            this.update();
                        }} color={"primary"}>{<AddIcon/>}</IconButton>
                    </Grid>
                </Grid>
            </div>
        )
    }
}
//  <------------------------- List -------------------------