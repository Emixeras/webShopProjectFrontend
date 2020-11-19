import React, {useEffect, useState} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CardActionArea from "@material-ui/core/CardActionArea";
import {margin, NavigationComponent, padding, showToast} from "../Utilities/Utilities";
import {
    base64ToDataUri,
    ContextType,
    filterArticle,
    ifExistsReturnOrElse,
    LazyImage,
    Pair,
    RETURN_MODE
} from "../Utilities/TsUtilities";
import {Link} from "react-router-dom";
import MenuDrawer from "./MenuDrawer";
import {
    Button,
    FormControl,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Slider,
    Switch
} from "@material-ui/core";
import {DialogBuilder} from "../Utilities/DialogBuilder";
import SettingsIcon from '@material-ui/icons/Settings';
import SearchIcon from '@material-ui/icons/Search';
import {Article} from "./EditArticles";
import InfiniteScroll from "react-infinite-scroll-component";

interface IProps {
    // @ts-ignore
    location: History.Location;
}

interface IState {
}

// interface Article {
//     id: number;
//     title: string;
//     description: string;
//     ean: number;
//     price: string;
//     artists: ArtistOrGenre;
//     genre: ArtistOrGenre;
//     picture?: { id: number, data: string };
// }

interface ArtistOrGenre {
    id: number;
    name: string;
}

interface GenrePayload {
    file: string;
    genre: ArtistOrGenre;
}

interface ImageResponseType {
    article: Article;
    file: string;
}

export default class AlbumOverview extends React.Component<IProps, IState> {
    IMAGE_RESOLUTION: string = "IMAGE_RESOLUTION";
    imageResolution: number = +(localStorage.getItem(this.IMAGE_RESOLUTION) as string);
    UNLOAD_IMAGES: string = "UNLOAD_IMAGES";
    unloadImages: boolean = (localStorage.getItem(this.UNLOAD_IMAGES) as string) == 'true';
    imageReloadArray: Array<() => void> = [];
    query: Pair<string, boolean> = Pair.make("", false);
    genreFilter?: GenrePayload;
    maxVisible: number = 24;
    hasMore: boolean = true;

    constructor(props: IProps, context: any) {
        super(props, context);
        if (this.props.location.state) {
            this.genreFilter = this.props.location.state.genre
        }
        this.loadArticles(this);
    }

    render() {
        if (window.location.pathname === "/") {
            return <NavigationComponent to={"/albums"}/>;
        }
        return (
            <MenuDrawer>
                <Album context={this}/>
            </MenuDrawer>
        )
    }

    loadArticles(context: AlbumOverview) {
        fetch(new Request("http://localhost:8080/article", {method: 'GET'}))
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error(`Fehler bei der Anfrage: ${response.status} ${response.statusText}`);
                }
            })
            .then((response: Article[]) => {
                response.sort((a, b) => a.id - b.id);
                articleArray = response;
                this.forceUpdate();
                // this.performanceTest(context);
            })
            .catch(reason => {
                showToast(reason.message, "error")
            })
    }

    loadSingleImage(id: number, onFinish: (imageResponse?: ImageResponseType) => void) {
        fetch(new Request(`http://localhost:8080/article/range;start=${id};end=${id};quality=${this.imageResolution}`, {method: 'GET'}))
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error(`Fehler bei der Anfrage: ${response.status} ${response.statusText}`);
                }
            })
            .then((response: ImageResponseType[]) => onFinish(response[0]))
            .catch(reason => {
                showToast(reason.message, "error")
            })
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
        if (this.query.second)
            reloadImages(this);
    }
}

const useStyles = makeStyles((theme) => ({
    icon: {
        marginRight: theme.spacing(2),
    },
    heroContent: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(3, 0, 2),
    },
    heroButtons: {
        marginTop: theme.spacing(4),
    },
    cardGrid: {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    cardMedia: {
        paddingTop: '100%', // 16:9
        backgroundColor: "lightgrey"
    },
    cardContent: {
        flexGrow: 1,
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
    },
}));

let articleArray: Array<Article> = [];

function Album(props: ContextType<AlbumOverview>) {
    const classes = useStyles();
    let context = props.context;
    let filteredArticleArray: Array<Article>;
    context.maxVisible = 24;
    context.hasMore = true;

    if (articleArray.length === 0)
        buildDummyData();

    // @ts-ignore
    let queryText = context.query.first + ifExistsReturnOrElse(context.genreFilter, input => ifExistsReturnOrElse(context.query.first, input1 => " & ", "") + "g: " + input.genre.name.toLowerCase(), "");
    if (queryText && articleArray[0].id !== -2) {
        filteredArticleArray = articleArray.filter(article => filterArticle(queryText, article))
    } else
        filteredArticleArray = articleArray;


    return (
        <React.Fragment>
            <main>
                <div className={classes.heroContent}>
                    <Container maxWidth="sm">
                        {!context.genreFilter ?
                            <div>
                                <Typography component="h1" variant="h2" align="center"
                                            color="textPrimary"
                                            gutterBottom>
                                    Unsere Alben
                                </Typography>
                                < Typography variant="h5" align="center" color="textSecondary"
                                             paragraph>
                                    Auf dieser Seite können Sie durch unsere Angebote stöbern
                                </Typography>
                            </div>
                            :
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                <FilterCard context={context}/>
                            </div>
                        }
                    </Container>
                    <Container maxWidth={"md"} style={{marginTop: 40}}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel htmlFor="albums-search">Suche</InputLabel>
                            <OutlinedInput
                                id="albums-search"
                                onChange={event => context.query.first = event.target.value.toLowerCase()}
                                onKeyUp={(event) => {
                                    if (event.key === 'Enter') {
                                        context.forceUpdate();
                                        context.query.second = true;
                                    }
                                }}
                                placeholder={"Titel: t, Künstler: a, Genre; g, Beschreibung: d, Preis: p (x-x), EAN: e"}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={event => {
                                                context.forceUpdate();
                                                context.query.second = true;
                                            }}
                                            edge="end"
                                        >
                                            {<SearchIcon/>}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                labelWidth={45}
                            />
                        </FormControl>
                        <UiSettings context={context}/>
                    </Container>
                </div>
                <Container className={classes.cardGrid} maxWidth="lg">
                    {filteredArticleArray.length > 0 ?


                        <GridList context={context} filteredArticleArray={filteredArticleArray}/>
                        :
                        <Typography style={{marginTop: 50}} variant="h6" align="center"
                                    gutterBottom>
                            Keine Alben gefunden
                        </Typography>
                    }
                </Container>
            </main>
        </React.Fragment>
    );
}
let cardRef: any
function FilterCard({context}: { context: AlbumOverview }) {

    // debugger
    // useEffect(() => {
    //     let listener = (ev: any) => {
    //         debugger
    //         if (cardRef) {
    //             // @ts-ignore
    //             console.log(`p: ${cardRef.parentElement.offsetWidth} | c: ${cardRef.clientWidth}`)
    //         }
    //     };
    //     window.addEventListener('resize', listener);
    //
    //     return () => window.removeEventListener('resize', listener)
    // }, []);

    return (
        <Card style={{minHeight: "250px"}} ref={instance => cardRef = instance}>
            <Grid container alignItems={"flex-end"} direction={"row"}>
                <Grid item>
                    <LazyImage
                        getSrc={setImgSrc => {
                            // @ts-ignore
                            setImgSrc(base64ToDataUri(context.genreFilter.file));
                        }}
                        style={{
                            width: "250px",
                            height: "250px",
                            backgroundColor: '#00BCD4'
                        }}
                        shouldImageUpdate={oldPayload => false}
                    />
                </Grid>
                <Grid item>
                    <Typography component="h1" variant="h2"
                                style={{minWidth: "250px", ...padding(16, 16, 0, 16)}}
                                color="textPrimary"
                    >
                        {
                            // @ts-ignore
                            context.genreFilter.genre.name
                        }
                    </Typography>
                </Grid>
            </Grid>
            {/*<CardContent>*/}
            {/*</CardContent>*/}
        </Card>
    )
}

function UiSettings({context}: ContextType<AlbumOverview>) {
    const [open, setOpen] = useState(false);
    const [checked, setChecked] = useState(context.unloadImages);
    return (
        <div style={{float: "right"}}>
            <Button style={{marginTop: 15}} onClick={event => {
                setOpen(true)
            }} endIcon={<SettingsIcon/>}>Einstellungen</Button>
            {new DialogBuilder(open, dialogBuilder => setOpen(false))
                .setTitle("UI Einstellungen")
                .setText("Die Qualität der Vorschaubilder und das Bilder-Ladeverhalten können angepasst werden")
                .setContent(dialogBuilder => {
                    return (
                        <div>
                            <Slider
                                style={{width: "95%", ...margin(30, 15, 0)}}
                                defaultValue={context.imageResolution}
                                getAriaValueText={value => `${value} Pixel`}
                                aria-labelledby="discrete-slider-small-steps"
                                step={50}
                                min={100}
                                max={500}
                                onMouseUp={event => {
                                    // @ts-ignore
                                    let value = +event.target.ariaValueNow;
                                    if (context.imageResolution !== value) {
                                        context.imageResolution = value;
                                        localStorage.setItem("IMAGE_RESOLUTION", `${value}`);
                                        reloadImages(context);
                                    }
                                }}
                                marks={[
                                    {
                                        value: 100,
                                        label: 'Klein',
                                    },
                                    {
                                        value: 250,
                                        label: 'Mittel',
                                    },
                                    {
                                        value: 400,
                                        label: 'Groß',
                                    },
                                    {
                                        value: 500,
                                        label: 'Full',
                                    },
                                ]}
                                valueLabelDisplay="on"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={checked}
                                        onChange={(event, checked) => {
                                            context.unloadImages = checked;
                                            setChecked(checked);
                                            localStorage.setItem(context.UNLOAD_IMAGES, `${checked}`)
                                        }}
                                        name="checkedB"
                                        color="primary"
                                    />
                                }
                                label="Bilder automatisch entladen"
                            />
                        </div>
                    )
                })
                // .addButton("Abbrechen")
                .addButton({label: "Ok", isActionButton: true})
                .build()}
        </div>
    )
}

function GridList({context, filteredArticleArray}: { context: AlbumOverview, filteredArticleArray: Article[] }): JSX.Element {

    // const [{hasMore, count}, setState] = useState(initialState);
    // const [hasMore, setHasMore] = useState(true);
    // const [count, setCount] = useState(24);
    const [dummy, setDummy] = useState(0);
    const step = 24;
    let shortedFilteredArticleArray: Article[];

    const fetchMoreData = () => {
        if (articleArray[0].id === -2)
            return;

        if (shortedFilteredArticleArray.length >= filteredArticleArray.length) {
            // setState(prevState => ({...prevState, hasMore: false}));
            context.hasMore = false;
            setDummy(dummy + 1);
            return;
        }

        if (context.maxVisible + step >= filteredArticleArray.length - 1) {
            // setState(({count: filteredArticleArray.length - 1, hasMore: false}));
            // setState(filteredArticleArray.length - 1);
            context.maxVisible = filteredArticleArray.length - 1;
            context.hasMore = false;
            setDummy(dummy + 1);
        } else {
            // setState(prevState => ({...prevState, count: count + step}));
            // setState(count + step);
            context.maxVisible += step;
            setDummy(dummy + 1);
        }
    };

    shortedFilteredArticleArray = filteredArticleArray.slice(0, context.maxVisible);

    return (
        <InfiniteScroll
            style={{width: "100%"}}
            dataLength={shortedFilteredArticleArray.length}
            next={fetchMoreData}
            hasMore={context.hasMore}
            loader={<h4 style={{color: "rgba(0, 0, 0, 0.54)", marginTop: 15}}>Laden...</h4>}
            endMessage={
                <p style={{textAlign: "center", color: "rgba(0, 0, 0, 0.54)", marginTop: 75}}>
                    <b>Keine weiteren Produkte ferfügbar</b>
                </p>
            }>
            <Grid container spacing={4}
                  style={{width: "100%"}}
            >
                {shortedFilteredArticleArray.map((article) => (
                    <ArticleComponent context={context} article={article}/>
                ))}
            </Grid>
        </InfiniteScroll>
    )
}

function reloadImages(context: AlbumOverview) {
    context.imageReloadArray.forEach(reload => reload())
}


function ArticleComponent(props: any) {
    const classes = useStyles();
    let article: Article = props.article;
    let context: AlbumOverview = props.context;
    let isDummy: boolean = article.id === -2;
    if (isDummy) {
        return (
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <Card className={classes.card}>
                    <CardMedia className={classes.cardMedia}/>
                    <CardContent className={classes.cardContent}>
                        <Grid container justify={"flex-end"}>
                            <Grid item xs={12}>
                                <Typography gutterBottom variant="h5" component="h2"
                                            style={{backgroundColor: "lightgrey"}}>
                                    {article.title}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container justify={"space-between"}>
                                    <Grid item xs={5}>
                                        <Typography style={{backgroundColor: "lightgrey"}}>
                                            {article.description}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={5}>
                                        <Typography style={{backgroundColor: "lightgrey"}}>
                                            {article.description}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item style={{width: "20%"}}>
                                <Typography
                                    style={{
                                        backgroundColor: "lightgrey",
                                        marginTop: 5,
                                        justifySelf: "end"
                                    }}>
                                    {article.description}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        )
    } else {
        return (
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <CardActionArea component={Link} to={(location: any) => {
                    location.pathname = "/articleView";

                    location.state = {article: article};

                    return location;
                }}>
                    <Card className={classes.card}>
                        <LazyImage
                            returnMode={RETURN_MODE.CARD_MEDIA}
                            alt={article.title}
                            className={classes.cardMedia}
                            payload={article}
                            getSrc={setImgSrc => {
                                if (article.picture && article.picture.data) {
                                    setImgSrc(base64ToDataUri(article.picture.data))
                                } else {
                                    context.loadSingleImage(article.id, imageResponse => {
                                        if (imageResponse)
                                            setImgSrc(base64ToDataUri(imageResponse.file));
                                    });
                                }
                            }}
                            reload={reload => context.imageReloadArray.push(reload)}
                        />
                        <CardContent className={classes.cardContent}>
                            <Grid container>
                                <Grid item xs={12}>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {article.title}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                        <Grid item xs>
                                            <Typography>
                                                {article.artists.name}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography style={{textAlign: "end"}}>
                                                {article.genre.name}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography style={{textAlign: "end"}}>
                                        {article.price + " €"}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </CardActionArea>
            </Grid>
        )
    }
}

function buildDummyData() {
    for (let i = 0; i < 12; i++) {
        articleArray.push({
            id: -2,
            title: "⠀",
            description: "⠀",
            price: "",
            ean: -1,
            genre: {id: -1, name: ""},
            artists: {id: -1, name: ""},
            picture: undefined
        })
    }
}