import { Helmet } from "react-helmet";
import { AuthenticatedRoute } from "../../components/conditional-route";

export const Society = () => {
  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>Society</title>
        </Helmet>
        <div>
          <h1>Society</h1>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};
