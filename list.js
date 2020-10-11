module.exports = {
    inlineProcessorList: [
        {
            name: '海綿寶寶圖片搜尋器',
            keywords: ['p', 'puffy', '海'],
            js: './puffy.js'
        },
        {
            name: '貼圖產生器',
            keywords: ['s', 'sticker', '貼'],
            js: './sticker.js'
        },
    ],
    subscribeIdList: {
        'baha': '動畫瘋更新通知',
        'github-release': 'GitHub 更新通知'
    }
}