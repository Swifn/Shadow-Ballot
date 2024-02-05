import { Helmet } from "react-helmet";
import { AuthenticatedRoute } from "../../components/conditional-route";

export const Landing = () => {
  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>SVS Chain</title>
        </Helmet>
        <div>
          <h1>SVS Chain Landing Page</h1>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};
