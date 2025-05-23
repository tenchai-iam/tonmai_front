//Listen for a message from the map html. If found, send the message to the provided asset ("region selector" or "asset_selector") element's "value property"
window.onmessage = function(e) {
        console.log(JSON.stringify(e.data));
        dash_clientside.set_props(e.data['type'], {'value' : e.data['value']});
}
