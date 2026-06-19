// Underground data model

function Underground({ stations, lines, segments } = {}) {
    //Attributes
    this.stations = stations ? stations : {};
    this.lines = lines ? lines : {};
    this.segments = segments ? segments : {};
};

export default Underground;