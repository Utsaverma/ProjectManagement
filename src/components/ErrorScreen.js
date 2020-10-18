import React from 'react';

class ErrorScreen extends React.Component {
    constructor(props){
        super(props);
    }
    render() {
      return <div className="errorContainer" onClick={()=>window.location.reload()}>
                <h1 className="error">{this.props.errMsg}</h1>
            </div>
    }
  }

export default ErrorScreen;