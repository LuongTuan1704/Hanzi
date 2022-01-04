const heading = document.getElementById('appHeader-heading')
const app = document.querySelector(".app-left");
const target = document.getElementById('target');
const form = document.querySelector('.form-data')

function renderFanningStrokes(target, strokes) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.width = '120px';
    svg.style.height = '120px';
    svg.style.border = '2px solid #DDD'
    svg.style.borderRadius = '3px'
    svg.style.margin = '5px'
    svg.style.boxSizing = 'content-box'
    svg.innerHTML = `
  <line x1="0" y1="0" x2="120" y2="120" stroke="#DDD" />
  <line x1="120" y1="0" x2="0" y2="120" stroke="#DDD" />
  <line x1="60" y1="0" x2="60" y2="120" stroke="#DDD" />
  <line x1="0" y1="60" x2="120" y2="60" stroke="#DDD" />
  `

    target.appendChild(svg);
    var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // set the transform property on the g element so the character renders at 75x75
    var transformData = HanziWriter.getScalingTransform(120, 120);
    group.setAttributeNS(null, 'transform', transformData.transform);
    svg.appendChild(group);

    strokes.forEach(function (strokePath) {
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttributeNS(null, 'd', strokePath);
        // style the character paths
        path.style.fill = '#fff';
        group.appendChild(path);
    });
}
const configView = {
    width: 150,
    height: 150,
    padding: 5,
    outlineColor: '#333',
    strokeColor: '#fff',
    showCharacter: false,
    showOutline: true,
    highlightOnComplete: true
}

function* genView(words) {
    let viewElement = document.createElement('div');
    let write;
    if(!words) return;
    if (words.length > 1) {
        for (let i = 0; i < words.length; i++) { 
        let viewElement = document.createElement('div');   
        let write = HanziWriter.create(viewElement, words[i], configView)
            viewElement.onclick = () => write.animateCharacter()
            HanziWriter.loadCharacterData(words[i]).then(function (charData) {
                let viewElements = document.createElement('div');
                viewElements.appendChild(viewElement)
                let len = document.createElement('h3')
                len.innerHTML = `Chữ <span style = 'color : gainsboro'> ${words[i]}</span> có ${charData.strokes.length} nét!`
                viewElements.appendChild(len)
                for (let i = 0; i < charData.strokes.length; i++) {
                    let strokesPortion = charData.strokes.slice(0, i + 1);
                    renderFanningStrokes(viewElements, strokesPortion);
                }
                target.appendChild(viewElements)
                              
                app.scrollTo({top: app.scrollHeight, behavior: "smooth" });
            });
            yield write
        }
    } else {
       write = HanziWriter.create(viewElement, words, configView)
        viewElement.onclick = () =>  write.animateCharacter()
        HanziWriter.loadCharacterData(words).then(function (charData) {
            let viewElements = document.createElement('div');
            let len = document.createElement('h3')
            len.innerHTML = `Chữ <span style = 'color : gainsboro'> ${words}</span> có ${charData.strokes.length} nét!`
            viewElements.appendChild(len)
            viewElements.appendChild(viewElement)
            for (let i = 0; i < charData.strokes.length; i++) {
                let strokesPortion = charData.strokes.slice(0, i + 1);
                renderFanningStrokes(viewElements, strokesPortion);
            }
            target.appendChild(viewElements)
        });
        yield write
    }
    console.log(words)
}



form.addEventListener('submit', function (e) {
    e.preventDefault()
    target.innerHTML = ''
    const data = Object.fromEntries(new FormData(e.target).entries())['text-query'].trim();
    (async () => {
        let gen = genView(data.split(' '))
        for (g of gen) {
            await g.animateCharacter();
        }
    })()
})