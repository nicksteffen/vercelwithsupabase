import { Activity } from "../types/Activity";

 export default function ActivityCard({ activity }: { activity: Activity }) {
    return (
        <div className="activity-card">
            <h2>{activity.name}</h2>
            <p>{activity.description}</p>
            <p>Category: {activity.category}</p>
            <p>Duration: {activity.duration_seconds} seconds</p>
            <p>Scoring Metric: {activity.scoring_metric}</p>
            <a href={`/activities/${activity.activity_type}`}>Start Activity</a>
        </div>
    );
}