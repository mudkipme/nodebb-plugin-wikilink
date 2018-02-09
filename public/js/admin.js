define('admin/plugins/wikilink', ['settings'], function (Settings) {
    var WikiLink = {};

    WikiLink.init = function () {
        Settings.load('wikilink', $('.wikilink-settings'));

        $('#save').on('click', function () {
            Settings.save('wikilink', $('.wikilink-settings'), function () {
                app.alert({
                    type: 'success',
                    alert_id: 'wikilink-saved',
                    title: 'Reload Required',
                    message: 'Please reload your NodeBB to have your changes take effect',
                    clickfn: function () {
                        socket.emit('admin.reload');
                    }
                });
            });
        });
    };

    return WikiLink;
});