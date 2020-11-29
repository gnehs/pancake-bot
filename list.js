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
        {
            name: '隨機變音符號轉換器（A->Å）',
            keywords: ['a', 'alphabet', '英'],
            js: './alphabet.js'
        },
    ],
    subscribeIdList: {
        'baha': '動畫瘋更新通知（無參數）',
        'github-release': 'GitHub 更新通知（參數：owner/repo）'
    }
}