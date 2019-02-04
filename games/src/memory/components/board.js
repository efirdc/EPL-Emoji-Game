import React from 'react';

const styles = {

    body : {
        "width": "90%",
        "height" : "80%",
        "color": "#2e3d49",
        "margin" : "0 auto"
    },

    title : {
        "fontFamily" : "Open Sans, sans-serif",
        "fontWeight" : "300",
        "margin": "10px 0px"
    },

    board : {
        "height" : "100%",
        "margin": "0 auto",
        "background": "-webkit-linear-gradient(290deg, #02CCBA 0%, #AA7ECD 100%)",
        "background": "linear-gradient(160deg, #02CCBA 0%, #AA7ECD 100%)",
        "padding": "32px",
        "borderRadius": "10px",
        "boxShadow": "12px 15px 20px 9px rgba(46, 61, 73, 0.25)"
    }
}
class GameBoard extends React.Component {
    render() {
        return(
            <div style = {styles.body}>
                <h1 style = {styles.title}>Memory</h1>
                <div style = {styles.board}></div>
            </div>
        )
    }
}

export default GameBoard;
