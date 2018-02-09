const meta = module.parent.require('./meta');
const utils = module.parent.require('./utils');

const WikiLink = {
    config: {
        prefix: 'https://en.wikipedia.org/wiki/'
    },

    onLoad({ router, middleware }, callback) {
        function render(req, res) {
            res.render('admin/plugins/wikilink');
        }

        router.get('/admin/plugins/wikilink', middleware.admin.buildHeader, render);
        router.get('/api/admin/plugins/wikilink', render);

        meta.settings.get('wikilink', function (err, options) {
            if (!err) {
                WikiLink.config = Object.assign({}, WikiLink.config, options);
            }
        });
        return setImmediate(callback, null, { router, middleware });
    },

    parse(text) {
        const makeLink = (title, display) => {
            display = utils.escapeHTML(display);
            const [article, hash] = title.split('#');
            let path = article.split(' ').join('_')
            .split('/').map(encodeURIComponent).join('/');
            if (hash) {
                path += '#' + encodeURIComponent(hash).split('%').join('.');
            }
            return `<a href="${WikiLink.config.prefix}${path}" title="${display}">${display}</a>`;
        };

        text = text.replace(/\[\[([^\[\]\|]{1,200})\]\]/g, (_, title) => makeLink(title, title));
        text = text.replace(/\[\[([^\[\]\|]{1,200})\|([^\[\]\|]{1,200})\]\]/g,
            (_, title, display) => makeLink(title, display));
        return text;
    },

    parsePost(data, callback) {
        if (data && data.postData && data.postData.content) {
            data.postData.content = WikiLink.parse(data.postData.content);
        }
        return setImmediate(callback, null, data);
    },

    parseSignature(data, callback) {
        if (data && data.userData && data.userData.signature) {
            data.userData.signature = WikiLink.parse(data.userData.signature);
        }
        return setImmediate(callback, null, data);
    },

    parseAboutMe(aboutme, callback) {
        if (aboutme) {
            aboutme = WikiLink.parse(aboutme);
        }
        return setImmediate(callback, null, aboutme);
    },

    addAdminMenu(custom_header, callback) {
        custom_header.plugins.push({
            route: '/plugins/wikilink',
            icon: 'fa-wikipedia-w',
            name: 'Wiki Link',
        });
        return setImmediate(callback, null, custom_header);
    }
};

module.exports = WikiLink;