const SignInAlert = () => {
  return (
    <>
    <ion-progress-bar type="indeterminate"></ion-progress-bar>
    <ion-progress-bar type="indeterminate" reversed={true}></ion-progress-bar>
    <h2 className="chip">Please Sign In</h2>
    <style jsx>{`
      .chip {
        text-align: center;
        color: green;
      }
    `}</style>
    </>
  );
}

export default SignInAlert;