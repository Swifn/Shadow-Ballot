import { Helmet } from "react-helmet";
import { AuthenticatedRoute } from "../../components/conditional-route";

export const Vote = () => {
  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>Vote</title>
        </Helmet>
        <div>
          <h1>Vote</h1>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};
