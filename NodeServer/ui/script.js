function do_upload() {
    let data = document.getElementById("file").files[0];
    const formData = new FormData();
    formData.append('minidump', data);
    var spin = document.getElementById("spinner");
    spin.classList.add("spinner-border");
    console.log('do_upload ', data)
    fetch("http://localhost:80/dump", {
        method: 'POST',
        body: formData
    }).then(response => response.json())
        .then(val => { alert(val.filename); console.log(val.filename); spin.classList.remove("spinner-border")});
};