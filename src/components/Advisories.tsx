import React, { useEffect, useState } from 'react';

const Advisories = () => {
  const [advisories, setAdvisories] = useState([]);

  useEffect(() => {
    const fetchAdvisories = async () => {
      const res = await fetch('/api/advisories');
      const data = await res.json();
      setAdvisories(data);
    };

    fetchAdvisories();
  }, []);

  return (
    <div>
      <h2>Advisories</h2>
      <ul>
        {advisories.map((advisory: any) => (
          <li key={advisory.id}>{advisory.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default Advisories;
