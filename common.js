let isData = false;

function result(){
    if(!isData){
        document.getElementById('info').innerHTML = "No result to save";
        return;
    }

    let result = "";
    let elements;
    // table1
    elements = document.getElementById('table_success').getElementsByTagName('td');
    for(let i = 0; i < elements.length; i++){
        result += prepare_td(elements[i], i);
    }
    result += "\n";

    // table2
    elements = document.getElementById('table').getElementsByTagName('td');
    for(let i = 0; i < elements.length; i++){
        result += prepare_td(elements[i], i);
    }

    download(result, "brutron", "txt");
}

function prepare_td(element, index){
    let result = "";
    let text = element.innerHTML;
    if(text == "<center>No used addresses found</center>")
        return result;
    if((index+2)%3 == 0)
        text = element.getElementsByTagName('a')[0].innerHTML;
    
    result += text + ";";

    if((index+1)%3 == 0)
        result += "\n";

    return result;
}

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

let file_content;
function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        file_content = contents;
    };
    reader.readAsText(file);
}