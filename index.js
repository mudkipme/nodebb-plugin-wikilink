const meta = require.main.require('./src/meta');
const utils = require.main.require('./src/utils');

const WikiLink = {
    config: {
        prefix: 'https://en.wikipedia.org/wiki/'
    },

    async onLoad({ router, middleware }) {
        function render(req, res) {
            res.render('admin/plugins/wikilink');
        }

        router.get('/admin/plugins/wikilink', middleware.admin.buildHeader, render);
        router.get('/api/admin/plugins/wikilink', render);

        const options = await meta.settings.get('wikilink');
        WikiLink.config = Object.assign({}, WikiLink.config, options);
        return { router, middleware };
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

    async parsePost(data) {
        if (data && data.postData && data.postData.content) {
            data.postData.content = WikiLink.parse(data.postData.content);
        }
        return data;
    },

    async parseSignature(data) {
        if (data && data.userData && data.userData.signature) {
            data.userData.signature = WikiLink.parse(data.userData.signature);
        }
        return data;
    },

    async parseAboutMe(aboutme) {
        if (aboutme) {
            aboutme = WikiLink.parse(aboutme);
        }
        return aboutme;
    },

    async addAdminMenu(custom_header) {
        custom_header.plugins.push({
            route: '/plugins/wikilink',
            icon: 'fa-wikipedia-w',
            name: 'Wiki Link',
        });
        return custom_header;
    }
};

module.exports = WikiLink;